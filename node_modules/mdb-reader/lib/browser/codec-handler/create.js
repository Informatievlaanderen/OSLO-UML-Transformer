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
var create_exports = {};
__export(create_exports, {
  createCodecHandler: () => createCodecHandler
});
module.exports = __toCommonJS(create_exports);
var import_JetFormat = require("../JetFormat/index.js");
var import_types = require("../JetFormat/types.js");
var import_identity = require("./handlers/identity.js");
var import_jet = require("./handlers/jet.js");
var import_office = require("./handlers/office/index.js");
function createCodecHandler(databaseDefinitionPage, password) {
  const format = (0, import_JetFormat.getJetFormat)(databaseDefinitionPage);
  switch (format.codecType) {
    case import_types.CodecType.JET:
      return (0, import_jet.createJetCodecHandler)(databaseDefinitionPage);
    case import_types.CodecType.OFFICE:
      return (0, import_office.createOfficeCodecHandler)(databaseDefinitionPage, password);
    default:
      return (0, import_identity.createIdentityHandler)();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createCodecHandler
});
