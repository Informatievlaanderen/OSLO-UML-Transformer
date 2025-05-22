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
var EncryptionVerifier_exports = {};
__export(EncryptionVerifier_exports, {
  parseEncryptionVerifier: () => parseEncryptionVerifier
});
module.exports = __toCommonJS(EncryptionVerifier_exports);
const SALT_SIZE_OFFSET = 138;
const SALT_OFFSET = 142;
const ENC_VERIFIER_SIZE = 16;
const SALT_SIZE = 16;
function parseEncryptionVerifier(encryptionProvider, cryptoAlgorithm) {
  const saltSize = encryptionProvider.readInt32LE(SALT_SIZE_OFFSET);
  if (saltSize !== SALT_SIZE) {
    throw new Error("Wrong salt size");
  }
  const salt = encryptionProvider.slice(SALT_OFFSET, SALT_OFFSET + SALT_SIZE);
  const encryptionVerifierOffset = SALT_OFFSET + SALT_SIZE;
  const verifierHashSizeOffset = encryptionVerifierOffset + ENC_VERIFIER_SIZE;
  const verifierHashOffset = verifierHashSizeOffset + 4;
  const encryptionVerifier = encryptionProvider.slice(encryptionVerifierOffset, verifierHashSizeOffset);
  const encryptionVerifierHashSize = encryptionProvider.readInt32LE(verifierHashSizeOffset);
  const encryptionVerifierHash = encryptionProvider.slice(verifierHashOffset, verifierHashOffset + cryptoAlgorithm.encryptionVerifierHashLength);
  return { salt, encryptionVerifier, encryptionVerifierHash, encryptionVerifierHashSize };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  parseEncryptionVerifier
});
