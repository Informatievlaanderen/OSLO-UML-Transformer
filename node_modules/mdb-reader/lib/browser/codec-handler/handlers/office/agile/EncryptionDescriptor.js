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
var EncryptionDescriptor_exports = {};
__export(EncryptionDescriptor_exports, {
  parseEncryptionDescriptor: () => parseEncryptionDescriptor
});
module.exports = __toCommonJS(EncryptionDescriptor_exports);
var import_fast_xml_parser = require("fast-xml-parser");
const xmlParser = new import_fast_xml_parser.XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  parseAttributeValue: true
});
const RESERVED_VALUE = 64;
function parseEncryptionDescriptor(buffer) {
  const reservedValue = buffer.readInt16LE(4);
  if (reservedValue !== RESERVED_VALUE) {
    throw new Error(`Unexpected reserved value ${reservedValue}`);
  }
  const xmlBuffer = buffer.slice(8);
  const xmlString = xmlBuffer.toString("ascii");
  const parsedXML = xmlParser.parse(xmlString);
  const keyData = parsedXML.encryption.keyData;
  const keyEncryptor = parsedXML.encryption.keyEncryptors.keyEncryptor["p:encryptedKey"];
  return {
    keyData: {
      blockSize: keyData.blockSize,
      cipher: {
        algorithm: keyData.cipherAlgorithm,
        chaining: keyData.cipherChaining
      },
      hash: {
        size: keyData.hashSize,
        algorithm: keyEncryptor.hashAlgorithm
      },
      salt: Buffer.from(keyData.saltValue, "base64")
    },
    passwordKeyEncryptor: {
      blockSize: keyEncryptor.blockSize,
      keyBits: keyEncryptor.keyBits,
      spinCount: keyEncryptor.spinCount,
      cipher: {
        algorithm: keyEncryptor.cipherAlgorithm,
        chaining: keyEncryptor.cipherChaining
      },
      hash: {
        size: keyEncryptor.hashSize,
        algorithm: keyEncryptor.hashAlgorithm
      },
      salt: Buffer.from(keyEncryptor.saltValue, "base64"),
      encrypted: {
        keyValue: Buffer.from(keyEncryptor.encryptedKeyValue, "base64"),
        verifierHashInput: Buffer.from(keyEncryptor.encryptedVerifierHashInput, "base64"),
        verifierHashValue: Buffer.from(keyEncryptor.encryptedVerifierHashValue, "base64")
      }
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  parseEncryptionDescriptor
});
