import { u128,u256 } from 'as-bignum/assembly'
import { JSON } from 'assemblyscript-json/assembly'
import * as Arrays from './common/arrays'

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
export function parseVarInt(b:Uint8Array): ParseVarIntResult {
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