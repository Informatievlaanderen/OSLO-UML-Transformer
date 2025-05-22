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
var column_exports = {};
__export(column_exports, {
  getColumnType: () => getColumnType,
  parseColumnFlags: () => parseColumnFlags
});
module.exports = __toCommonJS(column_exports);
var import_types = require("./types.js");
const columnTypeMap = {
  1: import_types.ColumnTypes.Boolean,
  2: import_types.ColumnTypes.Byte,
  3: import_types.ColumnTypes.Integer,
  4: import_types.ColumnTypes.Long,
  5: import_types.ColumnTypes.Currency,
  6: import_types.ColumnTypes.Float,
  7: import_types.ColumnTypes.Double,
  8: import_types.ColumnTypes.DateTime,
  9: import_types.ColumnTypes.Binary,
  10: import_types.ColumnTypes.Text,
  11: import_types.ColumnTypes.Long,
  12: import_types.ColumnTypes.Memo,
  15: import_types.ColumnTypes.RepID,
  16: import_types.ColumnTypes.Numeric,
  18: import_types.ColumnTypes.Complex,
  19: import_types.ColumnTypes.BigInt,
  20: import_types.ColumnTypes.DateTimeExtended
};
function getColumnType(typeValue) {
  const type = columnTypeMap[typeValue];
  if (type === void 0) {
    throw new Error("Unsupported column type");
  }
  return type;
}
function parseColumnFlags(flags) {
  return {
    fixedLength: !!(flags & 1),
    nullable: !!(flags & 2),
    autoLong: !!(flags & 4),
    autoUUID: !!(flags & 64)
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getColumnType,
  parseColumnFlags
});
