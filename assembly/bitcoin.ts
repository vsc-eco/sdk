import { u128, u256 } from 'as-bignum/assembly'
import * as Arrays from './common/arrays'
import { BigInt } from "as-bigint/assembly";
import { JSON, JSONEncoder } from "assemblyscript-json/assembly";
import { SystemAPI, db } from '.';
import { Crypto } from './common/crypto';

/**
 * @const {BigInt}
 */
export const RETARGET_PERIOD: i64 = 1209600;

/**
 * @const {BigInt}
 */
export const RETARGET_PERIOD_BLOCKS: i64 = 2016


export const DIFF_ONE_TARGET: u128 = u128.fromString('0xffff0000000000000000000000000000000000000000000000000000')



/**
 * Enum for transaction output types
 * @enum {BigInt}
 */
export enum OUTPUT_TYPES {
  NONE = 0,
  WPKH = 1,
  WSH = 2,
  OP_RETURN = 3,
  PKH = 4,
  SH = 5,
  NONSTANDARD = 6
};


/**
 * Enum for transaction input types
 * @enum {BigInt}
 */
export enum INPUT_TYPES {
  NONE = 0,
  LEGACY = 1,
  COMPATIBILITY = 2,
  WITNESS = 3
};


/**
 *
 * Determines the length of a VarInt in bytes
 * A VarInt of >1 byte is prefixed with a flag indicating its length
 *
 * @param {number}        flag The first byte of a VarInt
 * @returns {number}      The number of non-flag bytes in the VarInt
 */
export function determineVarIntDataLength(flag: u64): u64 {
  if (flag === 0xff) {
    return 8; // one-byte flag, 8 bytes data
  }
  if (flag === 0xfe) {
    return 4; // one-byte flag, 4 bytes data
  }
  if (flag === 0xfd) {
    return 2; // one-byte flag, 2 bytes data
  }

  return 0; // flag is data
}


class ParseVarIntResult {
  dataLength: u64
  number: u64
  constructor(dataLength: u64, number: u64) {
    this.dataLength = dataLength
    this.number = number
  }
}
/**
 *
 * Parse a VarInt into its data length and the number it represents.
 * Useful for Parsing Vins and Vouts
 *
 * @param {Uint8Array}    b The VarInt bytes
 * @returns {object}      The length of the payload, and the encoded integer
 */
export function parseVarInt(b: Uint8Array): ParseVarIntResult {
  const dataLength = <i32>determineVarIntDataLength(b[0]);

  if (dataLength === 0) {
    return new ParseVarIntResult(dataLength, b[0])
  }

  if (b.length < 1 + dataLength) {
    throw new RangeError('Read overrun during VarInt parsing');
  }

  const number = Arrays.bytesToUint(b.slice(1, 1 + <i32>dataLength));


  return new ParseVarIntResult(dataLength, number)
}


class ExtractInputAtIndexResult {
  err: string | null
  result: Uint8Array | null
  constructor(err: string | null, result: Uint8Array | null) {
    this.err = err;
    this.result = result;
  }
}
/**
 *
 * Extracts the nth input from the vin (0-indexed)
 *
 * Iterates over the vin. If you need to extract several,
 * write a custom function
 *
 * @param {Uint8Array}    vin The vin as a tightly-packed uint8array
 * @param {index}         index The 0-indexed location of the input to extract
 * @returns {Uint8Array}  The input as a u8a
 */
export function extractInputAtIndex(vin: Uint8Array, index: i32): ExtractInputAtIndexResult {
  const result0: ParseVarIntResult = parseVarInt(vin);
  // const { dataLength, number: nIns }: parseVarIntResult = parseVarInt(vin);
  if (index >= <i32>result0.number) {
    //   throw RangeError('Vin read overrun');
    //Cannot do errors in AS
    return new ExtractInputAtIndexResult('Vin read overrun', null)
  }

  let len = 0;
  let offset = 1 + result0.dataLength;

  for (let i = 0; i <= <i32>index; i += 1) {
    //   const remaining = Arrays.safeSlice(vin, <i32>offset, vin.length);
    const remaining = vin.slice(<i32>offset, vin.length)
    len = <i32>determineInputLength(remaining);
    if (i !== index) {
      offset += len;
    }
  }

  return new ExtractInputAtIndexResult(null, vin.slice(<i32>offset, <i32>offset + len))
}

class ExtractScriptSigLenResult {
  dataLength: u64
  scriptSigLen: u64
  constructor(dataLength: u64, scriptSigLen: u64) {
    this.dataLength = dataLength
    this.scriptSigLen = scriptSigLen
  }
}
/**
*
* Determines the length of a scriptSig in an input
* Will return 0 if passed a witness input
*
* @param {Uint8Array}    input The LEGACY input
* @returns {object}      The length of the script sig in object form
*/
export function extractScriptSigLen(input: Uint8Array): ExtractScriptSigLenResult {
  if (input.length < 37) {
    throw new Error('Read overrun');
  }
  const result0 = parseVarInt(input.slice(36));
  return new ExtractScriptSigLenResult(result0.dataLength, result0.number)
}

/**
*
* Determines the length of an input from its scriptsig
* 36 for outpoint, 1 for scriptsig length, 4 for sequence
*
* @param {Uint8Array}    input The input as a u8a
* @returns {BigInt}      The length of the input in bytes
*/
export function determineInputLength(input: Uint8Array): u64 {
  const result0 = extractScriptSigLen(input);
  return 41 + result0.dataLength + result0.scriptSigLen;
}


/**
*
* Hashes transaction to get txid
*
* @dev                   Supports LEGACY and WITNESS
* @param {Uint8Array}    version 4-bytes version
* @param {Uint8Array}    vin Raw bytes length-prefixed input vector
* @param {Uint8Array}    vout Raw bytes length-prefixed output vector
* @param {Uint8Array}    locktime 4-byte tx locktime
* @returns {Uint8Array}  32-byte transaction id, little endian
*/
export function calculateTxId(version: Uint8Array, vin: Uint8Array, vout: Uint8Array, locktime: Uint8Array): Uint8Array {
  let arr = new Uint8Array(version.length + vin.length + vout.length + locktime.length)
  arr.set(version, arr.byteOffset)
  arr.set(vin, arr.byteOffset)
  arr.set(vout, arr.byteOffset)
  arr.set(locktime, arr.byteOffset)
  return arr
  // return BTCUtils.hash256(
  //     arr
  // );
}

/**
 *
 * Checks validity of header work
 *
 * @param {Uint8Array}    digest Header digest
 * @param {Uint8Array}    target The target threshold
 * @returns {Boolean}     True if header work is valid, false otherwise
 */
export function validateHeaderWork(digest: Uint8Array, target: Uint8Array): boolean {
  const arr = new Uint8Array(32)
  arr.set(new Array<u8>(32).fill(0))
  if (Arrays.typedArraysAreEqual(digest, arr)) {
    return false;
  }
  return Arrays.bytesToUint(Arrays.reverseEndianness(digest)) < Arrays.bytesToUint(target);
}


// pla: code below focuses on validating proofs

export function calcKey(height: i32): string {
  const cs: i32 = 100;
  // pla: is math.floor really necessary?
  // const keyA: i32 = Mathf.floor(height / cs) * cs;
  const keyA: i32 = (height / cs) * cs;

  return keyA.toString() + "-" + (keyA + cs).toString();
}

export function getHeaders(key: string): Map<i64, string> {
  const pulledHeaders: Map<i64, string> = new Map<i64, string>();
  const fetchedHeaderState = db.getObject(`headers/${key}`);
  if (fetchedHeaderState !== "null") {
    const parsed = <JSON.Obj>JSON.parse(fetchedHeaderState);
    for (let i = 0; i < parsed.keys.length; ++i) {
      let key = parsed.keys[i];
      let blockRaw = getStringFromJSON(<JSON.Obj>parsed, key);
      let height = parseInt(key) as i64;
      pulledHeaders.set(height, blockRaw);
    }
  }

  return pulledHeaders;
}

export function getStringFromJSON(jsonObject: JSON.Obj, key: string): string {
  let extractedValue: JSON.Str | null = jsonObject.getString(key);
  if (extractedValue != null) {
    return extractedValue.valueOf();
  }

  return "";
}

export function extractPrevBlockLE(header: Uint8Array): Uint8Array {
  return header.slice(4, 36);
}

export function extractMerkleRootLE(header: Uint8Array): Uint8Array {
  return header.slice(36, 68);
}

// Implements bitcoin's hash256 (double sha2)
export function hash256(preImage: Uint8Array): Uint8Array {
  return Crypto.sha256(Crypto.sha256(preImage));
}

export class ConfirmingHeader {
  raw: string
  hash: string
  height: i64
  prevhash: string
  merkle_root: string

  constructor(raw: string, hash: string, height: i64, prevhash: string, merkle_root: string) {
    this.raw = raw
    this.hash = hash
    this.height = height
    this.prevhash = prevhash
    this.merkle_root = merkle_root
  }
}

export function serializeConfirmingHeader(confirmingHeader: ConfirmingHeader, encoder: JSONEncoder): void {
  encoder.pushObject("confirming_header");

  encoder.setString('raw', confirmingHeader.raw);
  encoder.setString('hash', confirmingHeader.hash);
  encoder.setInteger('height', confirmingHeader.height);
  encoder.setString('prevhash', confirmingHeader.prevhash);
  encoder.setString('merkle_root', confirmingHeader.merkle_root);

  encoder.popObject();
}

export function serializeProof(proof: Bitcoin.FullProof, encoder: JSONEncoder): void {
  encoder.pushObject(null);

  if (proof.confirming_header) {
    serializeConfirmingHeader(proof.confirming_header!, encoder);
  }
  encoder.setString('confirming_height', proof.confirming_height.toString());
  encoder.setString('version', proof.version);
  encoder.setString('vin', proof.vin);
  encoder.setString('vout', proof.vout);
  encoder.setString('locktime', proof.locktime);
  encoder.setString('tx_id', proof.tx_id);
  encoder.setString('intermediate_nodes', proof.intermediate_nodes);
  encoder.setInteger('index', proof.index);

  encoder.popObject();
}

export function deserializeProof(encoder: JSON.Obj): Bitcoin.FullProof {
  const confirming_height = encoder.getInteger('confirming_height')!.valueOf() as i64;
  const version = getStringFromJSON(encoder, 'version');
  const vin = getStringFromJSON(encoder, 'vin');
  const vout = getStringFromJSON(encoder, 'vout');
  const locktime = getStringFromJSON(encoder, 'locktime');
  const tx_id = getStringFromJSON(encoder, 'tx_id');
  const intermediate_nodes = getStringFromJSON(encoder, 'intermediate_nodes');
  const index = encoder.getInteger('index')!.valueOf() as i64;

  return new Bitcoin.FullProof(confirming_height, version, vin, vout, locktime, tx_id, intermediate_nodes, index);
}

export namespace Bitcoin {
  /**
   * Method to validate a Bitcoin transaction proof
   * @param proof The proof that should be validated
   * @returns true if the proof is valid, false otherwise
   */
  export function validateTxProofWrapper(proof: Bitcoin.FullProof): bool {
    let encoder = new JSONEncoder();
    serializeProof(proof, encoder);
    const serializedProof = encoder.toString();

    return validateTxProof(serializedProof);
  }

  export function validateTxProof(proofStringJSON: string): bool {
    const proofJSON = <JSON.Obj>JSON.parse(proofStringJSON);
    const proof = deserializeProof(proofJSON);

    const bundleHeaders: Map<i64, string> = getHeaders(calcKey(<i32>proof.confirming_height));
    const header = bundleHeaders.get(proof.confirming_height);
    const decodeHex = Arrays.Arrays.fromHexString(header);
    const prevBlockLE = extractPrevBlockLE(decodeHex);
    const prevBlock = Arrays.Arrays.toHexString(prevBlockLE, true);
    const merkleRoot = Arrays.Arrays.toHexString(extractMerkleRootLE(decodeHex), true);
    const headerHash = Arrays.Arrays.toHexString(hash256(decodeHex), true);

    proof.confirming_header = new ConfirmingHeader(header, headerHash, proof.confirming_height, prevBlock, merkleRoot);

    let encoder = new JSONEncoder();
    serializeProof(proof, encoder);
    const serializedProof = encoder.toString();
    const obj = new JSON.Obj()
    obj.set('arg0', serializedProof);
    const proofDTO = obj.stringify();

    const result = <JSON.Obj>JSON.parse(SystemAPI.call('bitcoin.validateSPVProof', proofDTO))

    if (result.has('result') && result.getBool('result')!.isBool) {
      const isValidProof = result.getBool('result')!.valueOf()
      // console.log('the proof is ' + (isValidProof ? 'valid': 'invalid'))
      return isValidProof;
    } else {
      //Never should happen
      throw new Error('Crypto - incorrect binding response')
    }
  }

  export class FullProof {
    confirming_header: ConfirmingHeader | null = null

    confirming_height: i64

    version: string
    vin: string
    vout: string
    locktime: string
    tx_id: string
    // pla: probably needs to be an array
    intermediate_nodes: string
    index: i64

    constructor(confirming_height: i64, version: string, vin: string, vout: string, locktime: string, tx_id: string, intermediate_nodes: string, index: i64) {
      this.confirming_height = confirming_height
      this.version = version
      this.vin = vin
      this.vout = vout
      this.locktime = locktime
      this.tx_id = tx_id
      this.intermediate_nodes = intermediate_nodes
      this.index = index
    }
  }
}