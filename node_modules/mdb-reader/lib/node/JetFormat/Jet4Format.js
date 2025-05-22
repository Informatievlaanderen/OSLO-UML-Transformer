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
var Jet4Format_exports = {};
__export(Jet4Format_exports, {
  jet4Format: () => jet4Format
});
module.exports = __toCommonJS(Jet4Format_exports);
var import_SortOrder = require("../SortOrder.js");
var import_types = require("./types.js");
const jet4Format = {
  codecType: import_types.CodecType.JET,
  pageSize: 4096,
  textEncoding: "ucs-2",
  defaultSortOrder: import_SortOrder.GENERAL_LEGACY_SORT_ORDER,
  databaseDefinitionPage: {
    encryptedSize: 128,
    passwordSize: 40,
    creationDateOffset: 114,
    // 114
    defaultSortOrder: {
      offset: 110,
      // 110
      size: 4
    }
  },
  dataPage: {
    recordCountOffset: 12,
    record: {
      countOffset: 12,
      columnCountSize: 2,
      variableColumnCountSize: 2
    }
  },
  tableDefinitionPage: {
    rowCountOffset: 16,
    variableColumnCountOffset: 43,
    columnCountOffset: 45,
    logicalIndexCountOffset: 47,
    realIndexCountOffset: 51,
    realIndexStartOffset: 63,
    realIndexEntrySize: 12,
    columnsDefinition: {
      typeOffset: 0,
      indexOffset: 5,
      variableIndexOffset: 7,
      flagsOffset: 15,
      fixedIndexOffset: 21,
      sizeOffset: 23,
      entrySize: 25
    },
    columnNames: {
      nameLengthSize: 2
    },
    usageMapOffset: 55
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  jet4Format
});
