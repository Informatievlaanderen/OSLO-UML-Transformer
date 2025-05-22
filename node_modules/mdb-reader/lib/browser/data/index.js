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
var data_exports = {};
__export(data_exports, {
  readFieldValue: () => readFieldValue
});
module.exports = __toCommonJS(data_exports);
var import_Database = require("../Database.js");
var import_types = require("../types.js");
var import_bigint = require("./bigint.js");
var import_binary = require("./binary.js");
var import_byte = require("./byte.js");
var import_complexOrLong = require("./complexOrLong.js");
var import_currency = require("./currency.js");
var import_datetime = require("./datetime.js");
var import_datetimextended = require("./datetimextended.js");
var import_double = require("./double.js");
var import_float = require("./float.js");
var import_integer = require("./integer.js");
var import_memo = require("./memo.js");
var import_numeric = require("./numeric.js");
var import_ole = require("./ole.js");
var import_repid = require("./repid.js");
var import_text = require("./text.js");
const readFnByColType = {
  [import_types.ColumnTypes.BigInt]: import_bigint.readBigInt,
  [import_types.ColumnTypes.Binary]: import_binary.readBinary,
  [import_types.ColumnTypes.Byte]: import_byte.readByte,
  [import_types.ColumnTypes.Complex]: import_complexOrLong.readComplexOrLong,
  [import_types.ColumnTypes.Currency]: import_currency.readCurrency,
  [import_types.ColumnTypes.DateTime]: import_datetime.readDateTime,
  [import_types.ColumnTypes.DateTimeExtended]: import_datetimextended.readDateTimeExtended,
  [import_types.ColumnTypes.Double]: import_double.readDouble,
  [import_types.ColumnTypes.Float]: import_float.readFloat,
  [import_types.ColumnTypes.Integer]: import_integer.readInteger,
  [import_types.ColumnTypes.Long]: import_complexOrLong.readComplexOrLong,
  [import_types.ColumnTypes.Text]: import_text.readText,
  [import_types.ColumnTypes.Memo]: import_memo.readMemo,
  [import_types.ColumnTypes.Numeric]: import_numeric.readNumeric,
  [import_types.ColumnTypes.OLE]: import_ole.readOLE,
  [import_types.ColumnTypes.RepID]: import_repid.readRepID
};
function readFieldValue(buffer, column, database) {
  if (column.type === import_types.ColumnTypes.Boolean) {
    throw new Error("readFieldValue does not handle type boolean");
  }
  const read = readFnByColType[column.type];
  if (!read) {
    return `Column type ${column.type} is currently not supported`;
  }
  return read(buffer, column, database);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  readFieldValue
});
