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
var Jet14Format_exports = {};
__export(Jet14Format_exports, {
  jet14Format: () => jet14Format
});
module.exports = __toCommonJS(Jet14Format_exports);
var import_SortOrder = require("../SortOrder.js");
var import_Jet12Format = require("./Jet12Format.js");
const jet14Format = {
  ...import_Jet12Format.jet12Format,
  defaultSortOrder: import_SortOrder.GENERAL_SORT_ORDER
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  jet14Format
});
