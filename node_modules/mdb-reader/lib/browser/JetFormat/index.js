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
var JetFormat_exports = {};
__export(JetFormat_exports, {
  getJetFormat: () => getJetFormat
});
module.exports = __toCommonJS(JetFormat_exports);
var import_Jet12Format = require("./Jet12Format.js");
var import_Jet14Format = require("./Jet14Format.js");
var import_Jet15Format = require("./Jet15Format.js");
var import_Jet16Format = require("./Jet16Format.js");
var import_Jet17Format = require("./Jet17Format.js");
var import_Jet3Format = require("./Jet3Format.js");
var import_Jet4Format = require("./Jet4Format.js");
var import_MSISAMFormat = require("./MSISAMFormat.js");
const OFFSET_VERSION = 20;
const OFFSET_ENGINE_NAME = 4;
const MSISAM_ENGINE = "MSISAM Database";
function getJetFormat(buffer) {
  const version = buffer[OFFSET_VERSION];
  switch (version) {
    case 0:
      return import_Jet3Format.jet3Format;
    case 1:
      if (buffer.slice(OFFSET_ENGINE_NAME, OFFSET_ENGINE_NAME + MSISAM_ENGINE.length).toString("ascii") === MSISAM_ENGINE) {
        return import_MSISAMFormat.msisamFormat;
      }
      return import_Jet4Format.jet4Format;
    case 2:
      return import_Jet12Format.jet12Format;
    case 3:
      return import_Jet14Format.jet14Format;
    case 4:
      return import_Jet15Format.jet15Format;
    case 5:
      return import_Jet16Format.jet16Format;
    case 6:
      return import_Jet17Format.jet17Format;
    default:
      throw new Error(`Unsupported version '${version}'`);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getJetFormat
});
