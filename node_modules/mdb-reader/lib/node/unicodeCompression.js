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
var unicodeCompression_exports = {};
__export(unicodeCompression_exports, {
  uncompressText: () => uncompressText
});
module.exports = __toCommonJS(unicodeCompression_exports);
var import_iconv_lite = require("./dependencies/iconv-lite/index.js");
function uncompressText(buffer, format) {
  if (format.textEncoding === "unknown") {
    return (0, import_iconv_lite.decodeWindows1252)(buffer);
  }
  if (buffer.length <= 2 || (buffer.readUInt8(0) & 255) !== 255 || (buffer.readUInt8(1) & 255) !== 254) {
    return buffer.toString("ucs-2");
  }
  let compressedMode = true;
  let curPos = 2;
  const uncompressedBuffer = Buffer.alloc((buffer.length - curPos) * 2);
  let uncompressedBufferPos = 0;
  while (curPos < buffer.length) {
    const curByte = buffer.readUInt8(curPos++);
    if (curByte === 0) {
      compressedMode = !compressedMode;
    } else if (compressedMode) {
      uncompressedBuffer[uncompressedBufferPos++] = curByte;
      uncompressedBuffer[uncompressedBufferPos++] = 0;
    } else if (buffer.length - curPos >= 2) {
      uncompressedBuffer[uncompressedBufferPos++] = curByte;
      uncompressedBuffer[uncompressedBufferPos++] = buffer.readUInt8(curPos++);
    }
  }
  return uncompressedBuffer.slice(0, uncompressedBufferPos).toString("ucs-2");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  uncompressText
});
