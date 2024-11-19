import { Bitcoin, ExtractInputAtIndexResult, extractInputAtIndex, validateHeaderWork } from './bitcoin'
import { Arrays, bytesToUint, typedArraysAreEqual } from './common/arrays'
import { Base58 } from './common/base58'
import { Base64 } from './common/base64'
import { Crypto } from './common/crypto'
import { db, console, SystemAPI, TxOutput } from './index'

export * from './common/index'
export * from './bitcoin'
export * from './index'

// exporting various functions from the assemblyscript modules for testing purposes

// Bitcoin exports
export function BitcoinValidateTxProof(proof: string): bool {
    return Bitcoin.validateTxProof(proof)
}

export function BitcoinValidateHeaderWork(digest: Uint8Array, target: Uint8Array): boolean {
    return validateHeaderWork(digest, target)
}

export function BitcoinExtractInputAtIndex(vin: Uint8Array, index: i32): string {
    extractInputAtIndex(vin, index)
    return ""
}

// crypto exports
export function CryptoSha256(param: Uint8Array): Uint8Array {
    return Crypto.sha256(param)
}

export function CryptoRipemd160(param: Uint8Array): Uint8Array {
    return Crypto.ripemd160(param)
}

// base64 exports
export function Base64Encode(bytes: Uint8Array): string {
    return Base64.encode(bytes)
}

export function Base64Decode(str: string): Uint8Array {
    return Base64.decode(str)
}

// base58 exports
export function Base58Encode(bytes: Uint8Array): string {
    return Base58.encode(bytes)
}

export function Base58Decode(str: string): Uint8Array {
    return Base58.decode(str)
}

// array exports
export function ArraysFromHexString(hex: string): Uint8Array {
    return Arrays.fromHexString(hex)
}

export function ArraysToHexString(buffer: Uint8Array, prepend0x: bool = false): string {
    return Arrays.toHexString(buffer, prepend0x)
}

export function ArraysEqual(first: Uint8Array | null, second: Uint8Array | null): bool {
    return Arrays.equal(first, second)
}

export function ArraysBytesToUint(uint8Arr: Uint8Array): u64 {
    return bytesToUint(uint8Arr)
}

export function ArraysTypedArraysAreEqual(a: Uint8Array, b: Uint8Array): boolean {
    return typedArraysAreEqual(a, b)
}

// index exports
export function ConsoleLog(str: string): void {
    console.log(str)
}

export function ConsoleLogNumber(num: i64): void {
    console.logNumber(num)
}

export function ConsoleLogBool(arg0: bool) {
    console.logBool(arg0)
}

export function ConsoleLogUint8Array(arg0: Uint8Array) {
    console.logUint8Array(arg0)
}

export function DbSetObject(key: string, val: string): void {
    db.setObject(key, val)
}

export function DbGetObject(key: string): string {
    return db.getObject(key)
}

export function SystemAPIGetEnv(argv0: string): string {
    return SystemAPI.getEnv(argv0)
}

export function SystemAPICall(name: string, params: string): string {
    return SystemAPI.call(name, params)
}

export function IndexGetEnv(): string {
    return SystemAPI.getEnv('msg.required_auths')
}