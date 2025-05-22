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
var jet_exports = {};
__export(jet_exports, {
  createJetCodecHandler: () => createJetCodecHandler
});
module.exports = __toCommonJS(jet_exports);
var import_crypto = require("../../crypto/index.js");
var import_util = require("../../util.js");
var import_identity = require("./identity.js");
var import_util2 = require("../util.js");
const KEY_OFFSET = 62;
const KEY_SIZE = 4;
function createJetCodecHandler(databaseDefinitionPage) {
  const encodingKey = databaseDefinitionPage.slice(KEY_OFFSET, KEY_OFFSET + KEY_SIZE);
  if ((0, import_util.isEmptyBuffer)(encodingKey)) {
    return (0, import_identity.createIdentityHandler)();
  }
  const decryptPage = (pageBuffer, pageIndex) => {
    const pagekey = (0, import_util2.getPageEncodingKey)(encodingKey, pageIndex);
    return (0, import_crypto.decryptRC4)(pagekey, pageBuffer);
  };
  return {
    decryptPage,
    verifyPassword: () => true
    // TODO
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createJetCodecHandler
});
