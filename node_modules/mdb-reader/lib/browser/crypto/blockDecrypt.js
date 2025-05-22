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
var blockDecrypt_exports = {};
__export(blockDecrypt_exports, {
  blockDecrypt: () => blockDecrypt
});
module.exports = __toCommonJS(blockDecrypt_exports);
var import_environment = require("../environment/index.js");
function blockDecrypt(cipher, key, iv, data) {
  const algorithm = `${cipher.algorithm}-${key.length * 8}-${cipher.chaining.slice(-3)}`;
  const decipher = (0, import_environment.createDecipheriv)(algorithm, key, iv);
  decipher.setAutoPadding(false);
  return decipher.update(data);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  blockDecrypt
});
