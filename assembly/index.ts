// The entry file of your WebAssembly module.
import { JSON } from 'assemblyscript-json/assembly'



export declare namespace console {
  //@ts-ignore valid in AS
  @external('sdk', 'console.log')
  function log(arg0: String): void
  //@ts-ignore valid in AS
  @external('sdk', 'console.logNumber')
  function logNumber(arg0: number): void
  //@ts-ignore valid in AS
  @external('sdk', 'console.logBool')
  function logBool(arg0: bool): void
  //@ts-ignore valid in AS
  @external('sdk', 'console.logUint8Array')
  function logUint8Array(arg0: Uint8Array): void
}

export declare namespace db {
  //@ts-ignore valid in AS
  @external('sdk', 'db.setObject')
  function setObject(key: String, val: string): void
  //@ts-ignore valid in AS
  @external('sdk', 'db.getObject')
  function getObject(key: String): string
}

export class TxOutput {
  json: JSON.Obj
  constructor() {
      this.json = new JSON.Obj()
  }

  /**
   * Optional debug msg
   * @param str 
   * @returns 
   */
  msg(str: String): this {
      this.json.set('msg', str)
      return this;
  }

  /**
   * Exit code
   * Positive numbers to indicate different successful outcomes
   * Negative numbers to indicate different failed outcomes
   * @param code 
   * @returns 
   */
  exitCode(code: i32): this {
      this.json.set('code', code)
      return this;
  }

  /**
   * Response value. Must be serialized object. Can be completely arbitrary
   * @param ret 
   */
  ret(ret: string): this {
    this.json.set('ret', ret)
    return this;
  }


  /**
   * Call when finished with output. 
   * String must be returned to the parent 
   * @returns 
   */
  done(): String {
      return this.json.stringify()
  }
}