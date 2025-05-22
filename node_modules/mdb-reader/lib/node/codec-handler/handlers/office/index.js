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
var office_exports = {};
__export(office_exports, {
  createOfficeCodecHandler: () => createOfficeCodecHandler
});
module.exports = __toCommonJS(office_exports);
var import_util = require("../../../util.js");
var import_identity = require("../identity.js");
var import_agile = require("./agile/index.js");
var import_EncryptionHeader = require("./EncryptionHeader.js");
var import_rc4_cryptoapi = require("./rc4-cryptoapi.js");
const MAX_PASSWORD_LENGTH = 255;
const CRYPT_STRUCTURE_OFFSET = 665;
const KEY_OFFSET = 62;
const KEY_SIZE = 4;
function createOfficeCodecHandler(databaseDefinitionPage, password) {
  const encodingKey = databaseDefinitionPage.slice(KEY_OFFSET, KEY_OFFSET + KEY_SIZE);
  if ((0, import_util.isEmptyBuffer)(encodingKey)) {
    return (0, import_identity.createIdentityHandler)();
  }
  const passwordBuffer = Buffer.from(password.substring(0, MAX_PASSWORD_LENGTH), "utf16le");
  const infoLength = databaseDefinitionPage.readUInt16LE(CRYPT_STRUCTURE_OFFSET);
  const encryptionProviderBuffer = databaseDefinitionPage.slice(CRYPT_STRUCTURE_OFFSET + 2, CRYPT_STRUCTURE_OFFSET + 2 + infoLength);
  const version = `${encryptionProviderBuffer.readUInt16LE(0)}.${encryptionProviderBuffer.readUInt16LE(2)}`;
  switch (version) {
    case "4.4":
      return (0, import_agile.createAgileCodecHandler)(encodingKey, encryptionProviderBuffer, passwordBuffer);
    case "4.3":
    case "3.3":
      throw new Error("Extensible encryption provider is not supported");
    case "4.2":
    case "3.2":
    case "2.2": {
      const flags = encryptionProviderBuffer.readInt32LE(4);
      if ((0, import_EncryptionHeader.isFlagSet)(flags, import_EncryptionHeader.EncryptionHeaderFlags.FCRYPTO_API_FLAG)) {
        if ((0, import_EncryptionHeader.isFlagSet)(flags, import_EncryptionHeader.EncryptionHeaderFlags.FAES_FLAG)) {
          throw new Error("Not implemented yet");
        } else {
          try {
            return (0, import_rc4_cryptoapi.createRC4CryptoAPICodecHandler)(encodingKey, encryptionProviderBuffer, passwordBuffer);
          } catch (e) {
          }
          throw new Error("Not implemented yet");
        }
      } else {
        throw new Error("Unknown encryption");
      }
    }
    case "1.1":
      throw new Error("Not implemented yet");
    default:
      throw new Error(`Unsupported encryption provider: ${version}`);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createOfficeCodecHandler
});
