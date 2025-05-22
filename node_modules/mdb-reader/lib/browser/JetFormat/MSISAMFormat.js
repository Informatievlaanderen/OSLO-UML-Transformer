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
var MSISAMFormat_exports = {};
__export(MSISAMFormat_exports, {
  msisamFormat: () => msisamFormat
});
module.exports = __toCommonJS(MSISAMFormat_exports);
var import_Jet4Format = require("./Jet4Format.js");
var import_types = require("./types.js");
const msisamFormat = {
  ...import_Jet4Format.jet4Format,
  codecType: import_types.CodecType.MSISAM
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  msisamFormat
});
