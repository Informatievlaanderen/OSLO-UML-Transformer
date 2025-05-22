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
var HashAlgorithm_exports = {};
__export(HashAlgorithm_exports, {
  HASH_ALGORITHMS: () => HASH_ALGORITHMS
});
module.exports = __toCommonJS(HashAlgorithm_exports);
const EXTERNAL = { id: 0 };
const SHA1 = { id: 32772 };
const HASH_ALGORITHMS = { EXTERNAL, SHA1 };
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HASH_ALGORITHMS
});
