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
var rc4_cryptoapi_exports = {};
__export(rc4_cryptoapi_exports, {
  createRC4CryptoAPICodecHandler: () => createRC4CryptoAPICodecHandler
});
module.exports = __toCommonJS(rc4_cryptoapi_exports);
var import_crypto = require("../../../crypto/index.js");
var import_util = require("../../../util.js");
var import_util2 = require("../../util.js");
var import_CryptoAlgorithm = require("./CryptoAlgorithm.js");
var import_EncryptionHeader = require("./EncryptionHeader.js");
var import_EncryptionVerifier = require("./EncryptionVerifier.js");
var import_HashAlgorithm = require("./HashAlgorithm.js");
const VALID_CRYPTO_ALGORITHMS = [import_CryptoAlgorithm.CRYPTO_ALGORITHMS.RC4];
const VALID_HASH_ALGORITHMS = [import_HashAlgorithm.HASH_ALGORITHMS.SHA1];
function createRC4CryptoAPICodecHandler(encodingKey, encryptionProvider, password) {
  const headerLength = encryptionProvider.readInt32LE(8);
  const headerBuffer = encryptionProvider.slice(12, 12 + headerLength);
  const encryptionHeader = (0, import_EncryptionHeader.parseEncryptionHeader)(headerBuffer, VALID_CRYPTO_ALGORITHMS, VALID_HASH_ALGORITHMS);
  const encryptionVerifier = (0, import_EncryptionVerifier.parseEncryptionVerifier)(encryptionProvider, encryptionHeader.cryptoAlgorithm);
  const baseHash = (0, import_crypto.hash)("sha1", [encryptionVerifier.salt, password]);
  const decryptPage = (pageBuffer, pageIndex) => {
    const pageEncodingKey = (0, import_util2.getPageEncodingKey)(encodingKey, pageIndex);
    const encryptionKey = getEncryptionKey(encryptionHeader, baseHash, pageEncodingKey);
    return (0, import_crypto.decryptRC4)(encryptionKey, pageBuffer);
  };
  return {
    decryptPage,
    verifyPassword: () => {
      const encryptionKey = getEncryptionKey(encryptionHeader, baseHash, (0, import_util.intToBuffer)(0));
      const rc4Decrypter = (0, import_crypto.createRC4Decrypter)(encryptionKey);
      const verifier = rc4Decrypter(encryptionVerifier.encryptionVerifier);
      const verifierHash = (0, import_util.fixBufferLength)(rc4Decrypter(encryptionVerifier.encryptionVerifierHash), encryptionVerifier.encryptionVerifierHashSize);
      const testHash = (0, import_util.fixBufferLength)((0, import_crypto.hash)("sha1", [verifier]), encryptionVerifier.encryptionVerifierHashSize);
      return verifierHash.equals(testHash);
    }
  };
}
function getEncryptionKey(header, baseHash, data) {
  const key = (0, import_crypto.hash)("sha1", [baseHash, data], (0, import_util.roundToFullByte)(header.keySize));
  if (header.keySize === 40) {
    return key.slice(0, (0, import_util.roundToFullByte)(128));
  }
  return key;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createRC4CryptoAPICodecHandler
});
