export namespace Arrays {
  /**
   * Checks if 2 Uint8Array are equal.
   * Note: if both first and second are null, then they are considered equal.
   * 
   * @param {Uint8Array | null} first - The first array to compare.
   * @param {Uint8Array | null} second - The second array to compare.
   * @returns {boolean} True if arrays are equal, false otherwise.
   */
  export function equal(
    first: Uint8Array | null,
    second: Uint8Array | null
  ): bool {
    if (first == null && second == null) {
      return true;
    }

    if (first == null && second != null) {
      return false;
    }

    if (first != null && second == null) {
      return false;
    }

    if (first!.length != second!.length) {
      return false;
    }

    for (let i = 0; i < first!.length; ++i) {
      if (first![i] != second![i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Convert the string `hex` which must consist of an even number of
   * hexadecimal digits to a `Uint8Array`. The string `hex` can optionally
   * start with '0x'.
   * 
   * @param {string} hex - The hexadecimal string to convert.
   * @returns {Uint8Array} The converted Uint8Array.
   */
  export function fromHexString(hex: string): Uint8Array {
    if (hex.length >= 2 && hex.charAt(0) == '0' && hex.charAt(1) == 'x') {
      hex = hex.substr(2);
    }
    let output = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      output[i / 2] = U8.parseInt(hex.substr(i, 2), 16);
    }
    return output;
  }

  /**
   * Convert the Uint8Array `buffer` into a hexadecimal digits string. The string can optionally
   * be appended with '0x'.
   * 
   * @param {Uint8Array} buffer - The array to convert to a hex string.
   * @param {boolean} [prepend0x=false] - Whether to prepend '0x' to the output string.
   * @returns {string} The resulting hex string.
   */
  export function toHexString(buffer: Uint8Array, prepend0x: bool = false): string {
    let output = '';

    if (prepend0x) {
      output += '0x';
    }

    for (let i = 0; i < buffer.length; i += 1) {
      output += `0${buffer[i].toString(16)}`.slice(-2);
    }

    return output;
  }
}

// /**
//  *
//  * Performs a safe slice on an array
//  * Errors if any invalid arguments are given
//  *
//  * @param {Uint8Array}    buf The u8a
//  * @param {Number|BigInt} first The index where the slice should start
//  * @param {Number|BigInt} last The index where the slice should end (non-inclusive)
//  * @returns {Uint8Array}  The slice
//  */
// export function safeSlice(buf: Uint8Array, first: i32 | null, last: i32 | null): Uint8Array {
//   let start: i32;
//   let end: i32;

//   if (!first) { start = 0; }
//   if (!last) { end = buf.length; }

//   // /* eslint-disable-next-line valid-typeof */
//   // if (typeof first === 'bigint') {
//   //   if (first > i32.MAX_VALUE) throw new RangeError('BigInt argument out of safe number range');
//   //   start = i32(first);
//   // } else {
//   // }
//   start = first;

//   /* eslint-disable-next-line valid-typeof */
//   // if (typeof last === 'bigint') {
//   //   if (last > i32.MAX_VALUE) throw new RangeError('BigInt argument out of safe number range');
//   //   end = Number(last);
//   // } else {
//     // }
//   end = last;

//   if (end > buf.length) { throw new Error('Tried to slice past end of array'); }
//   if (start < 0 || end < 0) { throw new Error('Slice must not use negative indexes'); }
//   if (start >= end) { throw new Error('Slice must not have 0 length'); }
//   return buf.slice(start, end);
// }

/**
 *
 * Converts big-endian array to a uint
 * Traverses the byte array and sums the bytes
 *
 * @param {Uint8Array} uint8Arr - The big-endian array-encoded integer.
 * @returns {u64} The integer representation.
 */
export function bytesToUint(uint8Arr: Uint8Array): u64 {
  let total = 0;
  for (let i = 0; i < uint8Arr.length; i += 1) {
    total += uint8Arr[i] << <u8>((uint8Arr.length - i - 1) * 8);
  }
  return total;
}

/**
 * Changes the endianness of a byte array.
 * Returns a new, reversed, byte array.
 *
 * @param {Uint8Array} uint8Arr - The array to reverse.
 * @returns {Uint8Array} The reversed array.
 */
export function reverseEndianness(uint8Arr: Uint8Array): Uint8Array {
  const buf = new Uint8Array(uint8Arr.length);
  buf.set(uint8Arr.reverse())
  return buf;
}

/**
 * Compares two Uint8Array arrays for equality.
 *
 * @param {Uint8Array} a - The first array.
 * @param {Uint8Array} b - The second array.
 * @returns {boolean} True if the arrays are equal, false otherwise.
 */
export function typedArraysAreEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (!(a instanceof Uint8Array) || !(b instanceof Uint8Array)) {
    throw new Error('Arrays must be of type Uint8Array');
  }

  if (a.byteLength !== b.byteLength) return false;
  for (let i = 0; i < a.byteLength; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
