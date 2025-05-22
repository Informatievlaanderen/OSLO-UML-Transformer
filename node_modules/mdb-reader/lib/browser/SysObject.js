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
var SysObject_exports = {};
__export(SysObject_exports, {
  SysObjectTypes: () => SysObjectTypes,
  isSysObjectType: () => isSysObjectType,
  isSystemObject: () => isSystemObject
});
module.exports = __toCommonJS(SysObject_exports);
const SysObjectTypes = {
  Form: 0,
  Table: 1,
  Macro: 2,
  SystemTable: 3,
  Report: 4,
  Query: 5,
  LinkedTable: 6,
  Module: 7,
  Relationship: 8,
  DatabaseProperty: 11
};
function isSysObjectType(typeValue) {
  return Object.values(SysObjectTypes).includes(typeValue);
}
const SYSTEM_OBJECT_FLAG = 2147483648;
const ALT_SYSTEM_OBJECT_FLAG = 2;
const SYSTEM_OBJECT_FLAGS = SYSTEM_OBJECT_FLAG | ALT_SYSTEM_OBJECT_FLAG;
function isSystemObject(o) {
  return (o.flags & SYSTEM_OBJECT_FLAGS) !== 0;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SysObjectTypes,
  isSysObjectType,
  isSystemObject
});
