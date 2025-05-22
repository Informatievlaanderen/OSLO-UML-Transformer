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
var Jet16Format_exports = {};
__export(Jet16Format_exports, {
  jet16Format: () => jet16Format
});
module.exports = __toCommonJS(Jet16Format_exports);
var import_Jet15Format = require("./Jet15Format.js");
const jet16Format = import_Jet15Format.jet15Format;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  jet16Format
});
