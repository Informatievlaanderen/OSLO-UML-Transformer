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
var Jet3Format_exports = {};
__export(Jet3Format_exports, {
  jet3Format: () => jet3Format
});
module.exports = __toCommonJS(Jet3Format_exports);
var import_SortOrder = require("../SortOrder.js");
var import_types = require("./types.js");
const jet3Format = {
  codecType: import_types.CodecType.JET,
  pageSize: 2048,
  textEncoding: "unknown",
  defaultSortOrder: import_SortOrder.GENERAL_97_SORT_ORDER,
  databaseDefinitionPage: {
    encryptedSize: 126,
    passwordSize: 20,
    creationDateOffset: null,
    defaultSortOrder: {
      offset: 58,
      // 58
      size: 2
    }
  },
  dataPage: {
    recordCountOffset: 8,
    record: {
      countOffset: 8,
      columnCountSize: 1,
      variableColumnCountSize: 1
    }
  },
  tableDefinitionPage: {
    rowCountOffset: 12,
    columnCountOffset: 25,
    variableColumnCountOffset: 23,
    logicalIndexCountOffset: 27,
    realIndexCountOffset: 31,
    realIndexStartOffset: 43,
    realIndexEntrySize: 8,
    columnsDefinition: {
      typeOffset: 0,
      indexOffset: 1,
      variableIndexOffset: 3,
      flagsOffset: 13,
      fixedIndexOffset: 14,
      sizeOffset: 16,
      entrySize: 18
    },
    columnNames: {
      nameLengthSize: 1
    },
    usageMapOffset: 35
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  jet3Format
});
