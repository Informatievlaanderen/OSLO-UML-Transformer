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
var numeric_exports = {};
__export(numeric_exports, {
  readNumeric: () => readNumeric
});
module.exports = __toCommonJS(numeric_exports);
var import_array = require("../array.js");
var import_util = require("./util.js");
const MAX_PRECISION = 40;
function readNumeric(buffer, column) {
  let product = (0, import_array.toArray)(0, MAX_PRECISION);
  let multiplier = (0, import_array.toArray)(1, MAX_PRECISION);
  const bytes = buffer.slice(1, 17);
  for (let i = 0; i < bytes.length; ++i) {
    const byte = bytes[12 - 4 * Math.floor(i / 4) + i % 4];
    product = (0, import_array.addArray)(product, (0, import_array.multiplyArray)(multiplier, (0, import_array.toArray)(byte, MAX_PRECISION)));
    multiplier = (0, import_array.multiplyArray)(multiplier, (0, import_array.toArray)(256, MAX_PRECISION));
  }
  const negative = !!(buffer[0] & 128);
  return (0, import_util.buildValue)(
    product,
    // Scale is always set for numeric columns
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    column.scale,
    negative
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  readNumeric
});
