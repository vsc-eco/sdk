import { JSON } from 'assemblyscript-json/assembly';
import { Arrays, SystemAPI } from '..';

export namespace Crypto {

  /**
   * Computes the SHA-256 hash of the given data.
   * 
   * @param {Uint8Array} param - The data to be hashed.
   * @returns {Uint8Array} The SHA-256 hash of the input data.
   * @throws {Error} If the system API returns an incorrect response.
   * @example
   * ```ts
   * const data = new Uint8Array([1, 2, 3]);
   * const hash = Crypto.sha256(data);
   * ```
   */
  export function sha256(param: Uint8Array): Uint8Array {
    const result = <JSON.Obj>JSON.parse(SystemAPI.call('crypto.sha256', JSON.from({
      arg0: Arrays.toHexString(param, false)
    }).stringify()));
    if (result.getString('result')!.isString) {
      return Arrays.fromHexString(result.getString('result')!.valueOf()!);
    } else {
      // Never should happen
      throw new Error('Crypto - incorrect binding response');
    }
  }

  /**
   * Computes the RIPEMD-160 hash of the given data.
   * 
   * @param {Uint8Array} param - The data to be hashed.
   * @returns {Uint8Array} The RIPEMD-160 hash of the input data.
   * @throws {Error} If the system API returns an incorrect response.
   * @example
   * ```ts
   * const data = new Uint8Array([1, 2, 3]);
   * const hash = Crypto.ripemd160(data);
   * ```
   */
  export function ripemd160(param: Uint8Array): Uint8Array {
    const result = <JSON.Obj>JSON.parse(SystemAPI.call('crypto.ripemd160', JSON.from({
      arg0: Arrays.toHexString(param, false)
    }).stringify()));
    if (result.getString('result')!.isString) {
      return Arrays.fromHexString(result.getString('result')!.valueOf()!);
    } else {
      // Never should happen
      throw new Error('Crypto - incorrect binding response');
    }
  }
}
