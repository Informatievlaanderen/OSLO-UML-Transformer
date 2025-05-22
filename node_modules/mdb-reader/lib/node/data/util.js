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
var util_exports = {};
__export(util_exports, {
  buildValue: () => buildValue
});
module.exports = __toCommonJS(util_exports);
function buildValue(array, scale, negative) {
  const length = array.length;
  let value = "";
  if (negative) {
    value += "-";
  }
  let top = length;
  while (top > 0 && top - 1 > scale && !array[top - 1]) {
    top--;
  }
  if (top === 0) {
    value += "0";
  } else {
    for (let i = top; i > 0; i--) {
      if (i === scale) {
        value += ".";
      }
      value += array[i - 1].toString();
    }
  }
  return value;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  buildValue
});
