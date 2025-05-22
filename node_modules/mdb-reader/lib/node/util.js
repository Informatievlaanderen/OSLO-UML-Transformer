"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var util_exports = {};
__export(util_exports, {
  fixBufferLength: () => fixBufferLength,
  getBitmapValue: () => getBitmapValue,
  intToBuffer: () => intToBuffer,
  isEmptyBuffer: () => isEmptyBuffer,
  isInRange: () => isInRange,
  roundToFullByte: () => roundToFullByte,
  xor: () => xor
});
module.exports = __toCommonJS(util_exports);
function getBitmapValue(bitmap, pos) {
  const byteNumber = Math.floor(pos / 8);
  const bitNumber = pos % 8;
  return !!(bitmap[byteNumber] & 1 << bitNumber);
}
function roundToFullByte(bits) {
  return Math.floor((bits + 7) / 8);
}
function xor(a, b) {
  const length = Math.max(a.length, b.length);
  const buffer = Buffer.allocUnsafe(length);
  for (let i = 0; i < length; i++) {
    buffer[i] = a[i] ^ b[i];
  }
  return buffer;
}
function isEmptyBuffer(buffer) {
  return buffer.every((v) => v === 0);
}
function intToBuffer(n) {
  const buffer = Buffer.allocUnsafe(4);
  buffer.writeInt32LE(n);
  return buffer;
}
function fixBufferLength(buffer, length, padByte = 0) {
  if (buffer.length > length) {
    return buffer.slice(0, length);
  }
  if (buffer.length < length) {
    return Buffer.from(buffer).fill(padByte, buffer.length, length);
  }
  return buffer;
}
function isInRange(from, to, value) {
  return from <= value && value <= to;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  fixBufferLength,
  getBitmapValue,
  intToBuffer,
  isEmptyBuffer,
  isInRange,
  roundToFullByte,
  xor
});
