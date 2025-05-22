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
var ole_exports = {};
__export(ole_exports, {
  readOLE: () => readOLE
});
module.exports = __toCommonJS(ole_exports);
var import_Database = require("../Database.js");
function readOLE(buffer, _col, database) {
  const memoLength = buffer.readUIntLE(0, 3);
  const bitmask = buffer.readUInt8(3);
  if (bitmask & 128) {
    return buffer.slice(12, 12 + memoLength);
  } else if (bitmask & 64) {
    const pageRow = buffer.readUInt32LE(4);
    const rowBuffer = database.findPageRow(pageRow);
    return rowBuffer.slice(0, memoLength);
  } else if (bitmask === 0) {
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
      memoDataBuffer = Buffer.concat([memoDataBuffer, rowBuffer.slice(4, buffer.length)]);
      pageRow = rowBuffer.readUInt32LE(0);
    } while (pageRow !== 0);
    return memoDataBuffer.slice(0, memoLength);
  } else {
    throw new Error(`Unknown memo type ${bitmask}`);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  readOLE
});
