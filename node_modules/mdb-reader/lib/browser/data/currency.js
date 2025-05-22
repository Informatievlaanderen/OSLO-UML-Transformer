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
var currency_exports = {};
__export(currency_exports, {
  readCurrency: () => readCurrency
});
module.exports = __toCommonJS(currency_exports);
var import_array = require("../array.js");
var import_util = require("./util.js");
const MAX_PRECISION = 20;
function readCurrency(buffer) {
  const bytesCount = 8;
  const scale = 4;
  let product = (0, import_array.toArray)(0, MAX_PRECISION);
  let multiplier = (0, import_array.toArray)(1, MAX_PRECISION);
  const bytes = buffer.slice(0, bytesCount);
  let negative = false;
  if (bytes[bytesCount - 1] & 128) {
    negative = true;
    for (let i = 0; i < bytesCount; ++i) {
      bytes[i] = ~bytes[i];
    }
    for (let i = 0; i < bytesCount; ++i) {
      ++bytes[i];
      if (bytes[i] != 0) {
        break;
      }
    }
  }
  for (const byte of bytes) {
    product = (0, import_array.addArray)(product, (0, import_array.multiplyArray)(multiplier, (0, import_array.toArray)(byte, MAX_PRECISION)));
    multiplier = (0, import_array.multiplyArray)(multiplier, (0, import_array.toArray)(256, MAX_PRECISION));
  }
  return (0, import_util.buildValue)(product, scale, negative);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  readCurrency
});
