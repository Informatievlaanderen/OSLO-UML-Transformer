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
var memo_exports = {};
__export(memo_exports, {
  readMemo: () => readMemo
});
module.exports = __toCommonJS(memo_exports);
var import_Database = require("../Database.js");
var import_unicodeCompression = require("../unicodeCompression.js");
const TYPE_THIS_PAGE = 128;
const TYPE_OTHER_PAGE = 64;
const TYPE_OTHER_PAGES = 0;
function readMemo(buffer, _col, database) {
  const memoLength = buffer.readUIntLE(0, 3);
  const type = buffer.readUInt8(3);
  switch (type) {
    case TYPE_THIS_PAGE: {
      const compressedText = buffer.slice(12, 12 + memoLength);
      return (0, import_unicodeCompression.uncompressText)(compressedText, database.format);
    }
    case TYPE_OTHER_PAGE: {
      const pageRow = buffer.readUInt32LE(4);
      const rowBuffer = database.findPageRow(pageRow);
      const compressedText = rowBuffer.slice(0, memoLength);
      return (0, import_unicodeCompression.uncompressText)(compressedText, database.format);
    }
    case TYPE_OTHER_PAGES: {
      let pageRow = buffer.readInt32LE(4);
      let memoDataBuffer = Buffer.alloc(0);
      do {
        const rowBuffer = database.findPageRow(pageRow);
        if (memoDataBuffer.length + rowBuffer.length - 4 > memoLength) {
          break;
        }
        if (rowBuffer.length === 0) {
          break;
        }
        memoDataBuffer = Buffer.concat([memoDataBuffer, rowBuffer.slice(4)]);
        pageRow = rowBuffer.readInt32LE(0);
      } while (pageRow !== 0);
      const compressedText = memoDataBuffer.slice(0, memoLength);
      return (0, import_unicodeCompression.uncompressText)(compressedText, database.format);
    }
    default:
      throw new Error(`Unknown memo type ${type}`);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  readMemo
});
