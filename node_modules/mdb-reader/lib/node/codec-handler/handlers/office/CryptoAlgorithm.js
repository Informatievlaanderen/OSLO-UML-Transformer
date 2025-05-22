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
var CryptoAlgorithm_exports = {};
__export(CryptoAlgorithm_exports, {
  CRYPTO_ALGORITHMS: () => CRYPTO_ALGORITHMS
});
module.exports = __toCommonJS(CryptoAlgorithm_exports);
const EXTERNAL = {
  id: 0,
  encryptionVerifierHashLength: 0,
  keySizeMin: 0,
  keySizeMax: 0
};
const RC4 = {
  id: 26625,
  encryptionVerifierHashLength: 20,
  keySizeMin: 40,
  keySizeMax: 512
};
const AES_128 = {
  id: 26625,
  encryptionVerifierHashLength: 32,
  keySizeMin: 128,
  keySizeMax: 128
};
const AES_192 = {
  id: 26127,
  encryptionVerifierHashLength: 32,
  keySizeMin: 192,
  keySizeMax: 192
};
const AES_256 = {
  id: 26128,
  encryptionVerifierHashLength: 32,
  keySizeMin: 256,
  keySizeMax: 256
};
const CRYPTO_ALGORITHMS = { EXTERNAL, RC4, AES_128, AES_192, AES_256 };
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CRYPTO_ALGORITHMS
});
