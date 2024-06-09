import { JSON } from 'assemblyscript-json/assembly'
import {Arrays, SystemAPI} from '..'


export namespace Crypto {
  export function sha256(param: Uint8Array): Uint8Array {
    const arg0Value: string = Arrays.toHexString(param, false);
    const obj = new JSON.Obj()
    obj.set('arg0', arg0Value)
    const result = <JSON.Obj>JSON.parse(SystemAPI.call('crypto.sha256', obj.stringify()))
    if(result.getString('result')!.isString) {
      return Arrays.fromHexString(result.getString('result')!.valueOf()!)
    } else {
      //Never should happen
      throw new Error('Crypto - incorrect binding response')
    }
  }

  export function ripemd160(param: Uint8Array): Uint8Array {
    const arg0Value: string = Arrays.toHexString(param, false);
    const obj = new JSON.Obj()
    obj.set('arg0', arg0Value)
    const result = <JSON.Obj>JSON.parse(SystemAPI.call('crypto.ripemd160', obj.stringify()))
    if(result.getString('result')!.isString) {
      return Arrays.fromHexString(result.getString('result')!.valueOf()!)
    } else {
      //Never should happen
      throw new Error('Crypto - incorrect binding response')
    }
  }
}