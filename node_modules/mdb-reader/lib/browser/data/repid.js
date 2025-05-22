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
var repid_exports = {};
__export(repid_exports, {
  readRepID: () => readRepID
});
module.exports = __toCommonJS(repid_exports);
function readRepID(buffer) {
  return buffer.slice(0, 4).swap32().toString("hex") + // swap for little-endian
  "-" + buffer.slice(4, 6).swap16().toString("hex") + // swap for little-endian
  "-" + buffer.slice(6, 8).swap16().toString("hex") + // swap for little-endian
  "-" + buffer.slice(8, 10).toString("hex") + // big-endian
  "-" + buffer.slice(10, 16).toString("hex");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  readRepID
});
