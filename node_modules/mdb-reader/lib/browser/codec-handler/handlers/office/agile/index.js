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
var agile_exports = {};
__export(agile_exports, {
  createAgileCodecHandler: () => createAgileCodecHandler
});
module.exports = __toCommonJS(agile_exports);
var import_crypto = require("../../../../crypto/index.js");
var import_util = require("../../../../util.js");
var import_util2 = require("../../../util.js");
var import_EncryptionDescriptor = require("./EncryptionDescriptor.js");
const ENC_VERIFIER_INPUT_BLOCK = [254, 167, 210, 118, 59, 75, 158, 121];
const ENC_VERIFIER_VALUE_BLOCK = [215, 170, 15, 109, 48, 97, 52, 78];
const ENC_VALUE_BLOCK = [20, 110, 11, 231, 171, 172, 208, 214];
function createAgileCodecHandler(encodingKey, encryptionProvider, password) {
  const { keyData, passwordKeyEncryptor } = (0, import_EncryptionDescriptor.parseEncryptionDescriptor)(encryptionProvider);
  const key = decryptKeyValue(password, passwordKeyEncryptor);
  const decryptPage = (b, pageNumber) => {
    const pageEncodingKey = (0, import_util2.getPageEncodingKey)(encodingKey, pageNumber);
    const iv = (0, import_crypto.hash)(keyData.hash.algorithm, [keyData.salt, pageEncodingKey], keyData.blockSize);
    return (0, import_crypto.blockDecrypt)(keyData.cipher, key, iv, b);
  };
  const verifyPassword = () => {
    const verifier = decryptVerifierHashInput(password, passwordKeyEncryptor);
    const verifierHash = decryptVerifierHashValue(password, passwordKeyEncryptor);
    let testHash = (0, import_crypto.hash)(passwordKeyEncryptor.hash.algorithm, [verifier]);
    const blockSize = passwordKeyEncryptor.blockSize;
    if (testHash.length % blockSize != 0) {
      const hashLength = Math.floor((testHash.length + blockSize - 1) / blockSize) * blockSize;
      testHash = (0, import_util.fixBufferLength)(testHash, hashLength);
    }
    return verifierHash.equals(testHash);
  };
  return {
    decryptPage,
    verifyPassword
  };
}
function decryptKeyValue(password, passwordKeyEncryptor) {
  const key = (0, import_crypto.deriveKey)(password, Buffer.from(ENC_VALUE_BLOCK), passwordKeyEncryptor.hash.algorithm, passwordKeyEncryptor.salt, passwordKeyEncryptor.spinCount, (0, import_util.roundToFullByte)(passwordKeyEncryptor.keyBits));
  return (0, import_crypto.blockDecrypt)(passwordKeyEncryptor.cipher, key, passwordKeyEncryptor.salt, passwordKeyEncryptor.encrypted.keyValue);
}
function decryptVerifierHashInput(password, passwordKeyEncryptor) {
  const key = (0, import_crypto.deriveKey)(password, Buffer.from(ENC_VERIFIER_INPUT_BLOCK), passwordKeyEncryptor.hash.algorithm, passwordKeyEncryptor.salt, passwordKeyEncryptor.spinCount, (0, import_util.roundToFullByte)(passwordKeyEncryptor.keyBits));
  return (0, import_crypto.blockDecrypt)(passwordKeyEncryptor.cipher, key, passwordKeyEncryptor.salt, passwordKeyEncryptor.encrypted.verifierHashInput);
}
function decryptVerifierHashValue(password, passwordKeyEncryptor) {
  const key = (0, import_crypto.deriveKey)(password, Buffer.from(ENC_VERIFIER_VALUE_BLOCK), passwordKeyEncryptor.hash.algorithm, passwordKeyEncryptor.salt, passwordKeyEncryptor.spinCount, (0, import_util.roundToFullByte)(passwordKeyEncryptor.keyBits));
  return (0, import_crypto.blockDecrypt)(passwordKeyEncryptor.cipher, key, passwordKeyEncryptor.salt, passwordKeyEncryptor.encrypted.verifierHashValue);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createAgileCodecHandler
});
