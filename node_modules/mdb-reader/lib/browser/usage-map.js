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
var usage_map_exports = {};
__export(usage_map_exports, {
  findMapPages: () => findMapPages
});
module.exports = __toCommonJS(usage_map_exports);
var import_util = require("./util.js");
var import_Database = require("./Database.js");
var import_PageType = require("./PageType.js");
function findMapPages(buffer, database) {
  switch (buffer[0]) {
    case 0:
      return findMapPages0(buffer);
    case 1:
      return findMapPages1(buffer, database);
    default:
      throw new Error("Unknown usage map type");
  }
}
function findMapPages0(buffer) {
  const pageStart = buffer.readUInt32LE(1);
  const bitmap = buffer.slice(5);
  return getPagesFromBitmap(bitmap, pageStart);
}
function findMapPages1(buffer, database) {
  const bitmapLength = (database.format.pageSize - 4) * 8;
  const mapCount = Math.floor((buffer.length - 1) / 4);
  const pages = [];
  for (let mapIndex = 0; mapIndex < mapCount; ++mapIndex) {
    const page = buffer.readUInt32LE(1 + mapIndex * 4);
    if (page === 0) {
      continue;
    }
    const pageBuffer = database.getPage(page);
    (0, import_PageType.assertPageType)(pageBuffer, import_PageType.PageType.PageUsageBitmaps);
    const bitmap = pageBuffer.slice(4);
    pages.push(...getPagesFromBitmap(bitmap, mapIndex * bitmapLength));
  }
  return pages;
}
function getPagesFromBitmap(bitmap, pageStart) {
  const pages = [];
  for (let i = 0; i < bitmap.length * 8; i++) {
    if ((0, import_util.getBitmapValue)(bitmap, i)) {
      pages.push(pageStart + i);
    }
  }
  return pages;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  findMapPages
});
