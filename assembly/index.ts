// The entry file of your WebAssembly module.




export declare namespace console {
  function log(arg0: String): void
  function logNumber(arg0: i32): void
  function logBool(arg0: bool): void
  function logUint8Array(arg0: Uint8Array): void
}

export declare namespace state {
  function setObject(key: String, val: string): void
  function getObject(key: String): string
}