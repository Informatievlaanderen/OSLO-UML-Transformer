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
var Database_exports = {};
__export(Database_exports, {
  Database: () => Database
});
module.exports = __toCommonJS(Database_exports);
var import_codec_handler = require("./codec-handler/index.js");
var import_crypto = require("./crypto/index.js");
var import_datetime = require("./data/datetime.js");
var import_JetFormat = require("./JetFormat/index.js");
var import_PageType = require("./PageType.js");
var import_unicodeCompression = require("./unicodeCompression.js");
var import_util = require("./util.js");
const PASSWORD_OFFSET = 66;
class Database {
  #buffer;
  #format;
  #codecHandler;
  #databaseDefinitionPage;
  constructor(buffer, password) {
    this.#buffer = buffer;
    (0, import_PageType.assertPageType)(this.#buffer, import_PageType.PageType.DatabaseDefinitionPage);
    this.#format = (0, import_JetFormat.getJetFormat)(this.#buffer);
    this.#databaseDefinitionPage = Buffer.alloc(this.#format.pageSize);
    this.#buffer.copy(this.#databaseDefinitionPage, 0, 0, this.#format.pageSize);
    decryptHeader(this.#databaseDefinitionPage, this.#format);
    this.#codecHandler = (0, import_codec_handler.createCodecHandler)(this.#databaseDefinitionPage, password);
    if (!this.#codecHandler.verifyPassword()) {
      throw new Error("Wrong password");
    }
  }
  get format() {
    return this.#format;
  }
  getPassword() {
    let passwordBuffer = this.#databaseDefinitionPage.slice(PASSWORD_OFFSET, PASSWORD_OFFSET + this.#format.databaseDefinitionPage.passwordSize);
    const mask = this.#getPasswordMask();
    if (mask !== null) {
      passwordBuffer = (0, import_util.xor)(passwordBuffer, mask);
    }
    if ((0, import_util.isEmptyBuffer)(passwordBuffer)) {
      return null;
    }
    let password = (0, import_unicodeCompression.uncompressText)(passwordBuffer, this.#format);
    const nullCharIndex = password.indexOf("\0");
    if (nullCharIndex >= 0) {
      password = password.slice(0, nullCharIndex);
    }
    return password;
  }
  #getPasswordMask() {
    if (this.#format.databaseDefinitionPage.creationDateOffset === null) {
      return null;
    }
    const mask = Buffer.alloc(this.#format.databaseDefinitionPage.passwordSize);
    const dateValue = this.#databaseDefinitionPage.readDoubleLE(this.#format.databaseDefinitionPage.creationDateOffset);
    mask.writeInt32LE(Math.floor(dateValue));
    for (let i = 0; i < mask.length; ++i) {
      mask[i] = mask[i % 4];
    }
    return mask;
  }
  getCreationDate() {
    if (this.#format.databaseDefinitionPage.creationDateOffset === null) {
      return null;
    }
    const creationDateBuffer = this.#databaseDefinitionPage.slice(this.#format.databaseDefinitionPage.creationDateOffset, this.#format.databaseDefinitionPage.creationDateOffset + 8);
    return (0, import_datetime.readDateTime)(creationDateBuffer);
  }
  getDefaultSortOrder() {
    const value = this.#databaseDefinitionPage.readUInt16LE(this.#format.databaseDefinitionPage.defaultSortOrder.offset + 3);
    if (value === 0) {
      return this.#format.defaultSortOrder;
    }
    let version = this.#format.defaultSortOrder.version;
    if (this.#format.databaseDefinitionPage.defaultSortOrder.size == 4) {
      version = this.#databaseDefinitionPage.readUInt8(this.#format.databaseDefinitionPage.defaultSortOrder.offset + 3);
    }
    return Object.freeze({ value, version });
  }
  getPage(page) {
    if (page === 0) {
      return this.#databaseDefinitionPage;
    }
    const offset = page * this.#format.pageSize;
    if (this.#buffer.length < offset) {
      throw new Error(`Page ${page} does not exist`);
    }
    const pageBuffer = this.#buffer.slice(offset, offset + this.#format.pageSize);
    return this.#codecHandler.decryptPage(pageBuffer, page);
  }
  /**
   * @param pageRow Lower byte contains the row number, the upper three contain page
   *
   * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/src/libmdb/data.c#L102-L124
   */
  findPageRow(pageRow) {
    const page = pageRow >> 8;
    const row = pageRow & 255;
    const pageBuffer = this.getPage(page);
    return this.findRow(pageBuffer, row);
  }
  /**
   * @param pageBuffer Buffer of a data page
   *
   * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/src/libmdb/data.c#L126-L138
   */
  findRow(pageBuffer, row) {
    const rco = this.#format.dataPage.recordCountOffset;
    if (row > 1e3) {
      throw new Error("Cannot read rows > 1000");
    }
    const start = pageBuffer.readUInt16LE(rco + 2 + row * 2);
    const nextStart = row === 0 ? this.#format.pageSize : pageBuffer.readUInt16LE(rco + row * 2);
    return pageBuffer.slice(start, nextStart);
  }
}
const ENCRYPTION_START = 24;
const ENCRYPTION_KEY = [199, 218, 57, 107];
function decryptHeader(buffer, format) {
  const decryptedBuffer = (0, import_crypto.decryptRC4)(Buffer.from(ENCRYPTION_KEY), buffer.slice(ENCRYPTION_START, ENCRYPTION_START + format.databaseDefinitionPage.encryptedSize));
  decryptedBuffer.copy(buffer, ENCRYPTION_START);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Database
});
