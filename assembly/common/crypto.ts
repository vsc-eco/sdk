import { JSON } from 'assemblyscript-json/assembly'
import {Arrays, system} from '..'


export namespace Crypto {
  export function sha256(param: Uint8Array): Uint8Array {
    const result = <JSON.Obj>JSON.parse(system.call('crypto.sha256', JSON.from({
      arg0: Arrays.toHexString(param, false)
    }).stringify()))
    if(result.getString('result')!.isString) {
      return Arrays.fromHexString(result.getString('result')!.valueOf()!)
    } else {
      //Never should happen
      throw new Error('Crypto - incorrect binding response')
    }
  }
  export function ripemd160(param: Uint8Array): Uint8Array {
    const result = <JSON.Obj>JSON.parse(system.call('crypto.ripemd160', JSON.from({
      arg0: Arrays.toHexString(param, false)
    }).stringify()))
    if(result.getString('result')!.isString) {
      return Arrays.fromHexString(result.getString('result')!.valueOf()!)
    } else {
      //Never should happen
      throw new Error('Crypto - incorrect binding response')
    }
  }
}