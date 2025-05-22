/// <reference types="node" resolution-mode="require"/>
/**
 * Reads a specific bit of a bitmap. Returns true for 1 and false for 0.
 *
 * @param pos 0-based
 */
export declare function getBitmapValue(bitmap: Buffer, pos: number): boolean;
/**
 * Returns the number of bytes required to store a specific number of bits.
 */
export declare function roundToFullByte(bits: number): number;
/**
 * @see https://github.com/crypto-browserify/buffer-xor
 */
export declare function xor(a: Buffer, b: Buffer): Buffer;
/**
 * Returns true if buffer only contains zeros.
 */
export declare function isEmptyBuffer(buffer: Buffer): boolean;
export declare function intToBuffer(n: number): Buffer;
export declare function fixBufferLength(buffer: Buffer, length: number, padByte?: number): Buffer;
export declare function isInRange(from: number, to: number, value: number): boolean;
