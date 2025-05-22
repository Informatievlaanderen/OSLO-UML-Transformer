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
var deriveKey_exports = {};
__export(deriveKey_exports, {
  deriveKey: () => deriveKey
});
module.exports = __toCommonJS(deriveKey_exports);
var import_util = require("../util.js");
var import_hash = require("./hash.js");
function deriveKey(password, blockBytes, algorithm, salt, iterations, keyByteLength) {
  const baseHash = (0, import_hash.hash)(algorithm, [salt, password]);
  const iterHash = iterateHash(algorithm, baseHash, iterations);
  const finalHash = (0, import_hash.hash)(algorithm, [iterHash, blockBytes]);
  return (0, import_util.fixBufferLength)(finalHash, keyByteLength, 54);
}
function iterateHash(algorithm, baseBuffer, iterations) {
  let iterHash = baseBuffer;
  for (let i = 0; i < iterations; ++i) {
    iterHash = (0, import_hash.hash)(algorithm, [(0, import_util.intToBuffer)(i), iterHash]);
  }
  return iterHash;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  deriveKey
});
