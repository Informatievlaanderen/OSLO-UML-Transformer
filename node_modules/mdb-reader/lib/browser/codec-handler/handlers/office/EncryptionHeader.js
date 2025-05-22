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
var EncryptionHeader_exports = {};
__export(EncryptionHeader_exports, {
  EncryptionHeaderFlags: () => EncryptionHeaderFlags,
  isFlagSet: () => isFlagSet,
  parseEncryptionHeader: () => parseEncryptionHeader
});
module.exports = __toCommonJS(EncryptionHeader_exports);
var import_util = require("../../../util.js");
var import_CryptoAlgorithm = require("./CryptoAlgorithm.js");
var import_HashAlgorithm = require("./HashAlgorithm.js");
const FLAGS_OFFSET = 0;
const CRYPTO_OFFSET = 8;
const HASH_OFFSET = 12;
const KEY_SIZE_OFFSET = 16;
const EncryptionHeaderFlags = {
  FCRYPTO_API_FLAG: 4,
  FDOC_PROPS_FLAG: 8,
  FEXTERNAL_FLAG: 16,
  FAES_FLAG: 32
};
function parseEncryptionHeader(buffer, validCryptoAlgorithms, validHashAlgorithm) {
  const flags = buffer.readInt32LE(FLAGS_OFFSET);
  const cryptoAlgorithm = getCryptoAlgorithm(buffer.readInt32LE(CRYPTO_OFFSET), flags);
  const hashAlgorithm = getHashAlgorithm(buffer.readInt32LE(HASH_OFFSET), flags);
  const keySize = getKeySize(buffer.readInt32LE(KEY_SIZE_OFFSET), cryptoAlgorithm, getCSPName(buffer.slice(32)));
  if (!validCryptoAlgorithms.includes(cryptoAlgorithm)) {
    throw new Error("Invalid encryption algorithm");
  }
  if (!validHashAlgorithm.includes(hashAlgorithm)) {
    throw new Error("Invalid hash algorithm");
  }
  if (!(0, import_util.isInRange)(cryptoAlgorithm.keySizeMin, cryptoAlgorithm.keySizeMax, keySize)) {
    throw new Error("Invalid key size");
  }
  if (keySize % 8 !== 0) {
    throw new Error("Key size must be multiple of 8");
  }
  return {
    cryptoAlgorithm,
    hashAlgorithm,
    keySize
  };
}
function getCryptoAlgorithm(id, flags) {
  if (id === import_CryptoAlgorithm.CRYPTO_ALGORITHMS.EXTERNAL.id) {
    if (isFlagSet(flags, EncryptionHeaderFlags.FEXTERNAL_FLAG)) {
      return import_CryptoAlgorithm.CRYPTO_ALGORITHMS.EXTERNAL;
    }
    if (isFlagSet(flags, EncryptionHeaderFlags.FCRYPTO_API_FLAG)) {
      if (isFlagSet(flags, EncryptionHeaderFlags.FAES_FLAG)) {
        return import_CryptoAlgorithm.CRYPTO_ALGORITHMS.AES_128;
      } else {
        return import_CryptoAlgorithm.CRYPTO_ALGORITHMS.RC4;
      }
    }
    throw new Error("Unsupported encryption algorithm");
  }
  const algorithm = Object.values(import_CryptoAlgorithm.CRYPTO_ALGORITHMS).find((alg) => alg.id === id);
  if (algorithm) {
    return algorithm;
  }
  throw new Error("Unsupported encryption algorithm");
}
function getHashAlgorithm(id, flags) {
  if (id === import_HashAlgorithm.HASH_ALGORITHMS.EXTERNAL.id) {
    if (isFlagSet(flags, EncryptionHeaderFlags.FEXTERNAL_FLAG)) {
      return import_HashAlgorithm.HASH_ALGORITHMS.EXTERNAL;
    }
    return import_HashAlgorithm.HASH_ALGORITHMS.SHA1;
  }
  const algorithm = Object.values(import_HashAlgorithm.HASH_ALGORITHMS).find((alg) => alg.id === id);
  if (algorithm) {
    return algorithm;
  }
  throw new Error("Unsupported hash algorithm");
}
function getCSPName(buffer) {
  const str = buffer.toString("utf16le");
  return str.slice(0, str.length - 1);
}
function getKeySize(keySize, algorithm, cspName) {
  if (keySize !== 0) {
    return keySize;
  }
  if (algorithm === import_CryptoAlgorithm.CRYPTO_ALGORITHMS.RC4) {
    const cspLowerTrimmed = cspName.trim().toLowerCase();
    if (cspLowerTrimmed.length === 0 || cspLowerTrimmed.includes(" base ")) {
      return 40;
    } else {
      return 128;
    }
  }
  return 0;
}
function isFlagSet(flagValue, flagMask) {
  return (flagValue & flagMask) !== 0;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EncryptionHeaderFlags,
  isFlagSet,
  parseEncryptionHeader
});
