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
var types_exports = {};
__export(types_exports, {
  CodecType: () => CodecType
});
module.exports = __toCommonJS(types_exports);
var CodecType;
(function(CodecType2) {
  CodecType2[CodecType2["JET"] = 0] = "JET";
  CodecType2[CodecType2["MSISAM"] = 1] = "MSISAM";
  CodecType2[CodecType2["OFFICE"] = 2] = "OFFICE";
})(CodecType || (CodecType = {}));
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CodecType
});
