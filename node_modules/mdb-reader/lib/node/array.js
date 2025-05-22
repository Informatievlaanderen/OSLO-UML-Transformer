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
var array_exports = {};
__export(array_exports, {
  addArray: () => addArray,
  doCarry: () => doCarry,
  multiplyArray: () => multiplyArray,
  toArray: () => toArray
});
module.exports = __toCommonJS(array_exports);
function doCarry(values) {
  const result = [...values];
  const length = result.length;
  for (let i = 0; i < length - 1; ++i) {
    result[i + 1] += Math.floor(result[i] / 10);
    result[i] = result[i] % 10;
  }
  result[length - 1] = result[length - 1] % 10;
  return result;
}
function multiplyArray(a, b) {
  if (a.length !== b.length) {
    throw new Error("Array a and b must have the same length");
  }
  const result = new Array(a.length).fill(0);
  for (let i = 0; i < a.length; ++i) {
    if (a[i] === 0)
      continue;
    for (let j = 0; j < b.length; j++) {
      result[i + j] += a[i] * b[j];
    }
  }
  return doCarry(result.slice(0, a.length));
}
function addArray(a, b) {
  if (a.length !== b.length) {
    throw new Error("Array a and b must have the same length");
  }
  const length = a.length;
  const result = [];
  for (let i = 0; i < length; ++i) {
    result[i] = a[i] + b[i];
  }
  return doCarry(result);
}
function toArray(v, length) {
  return doCarry([v, ...new Array(length - 1).fill(0)]);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  addArray,
  doCarry,
  multiplyArray,
  toArray
});
