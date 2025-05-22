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
var PageType_exports = {};
__export(PageType_exports, {
  PageType: () => PageType,
  assertPageType: () => assertPageType
});
module.exports = __toCommonJS(PageType_exports);
var PageType;
(function(PageType2) {
  PageType2[PageType2["DatabaseDefinitionPage"] = 0] = "DatabaseDefinitionPage";
  PageType2[PageType2["DataPage"] = 1] = "DataPage";
  PageType2[PageType2["TableDefinition"] = 2] = "TableDefinition";
  PageType2[PageType2["IntermediateIndexPage"] = 3] = "IntermediateIndexPage";
  PageType2[PageType2["LeafIndexPages"] = 4] = "LeafIndexPages";
  PageType2[PageType2["PageUsageBitmaps"] = 5] = "PageUsageBitmaps";
})(PageType || (PageType = {}));
function assertPageType(buffer, pageType) {
  if (buffer[0] !== pageType) {
    throw new Error(`Wrong page type. Expected ${pageType} but received ${buffer[0]}.`);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PageType,
  assertPageType
});
