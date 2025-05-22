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
var datetimextended_exports = {};
__export(datetimextended_exports, {
  readDateTimeExtended: () => readDateTimeExtended
});
module.exports = __toCommonJS(datetimextended_exports);
const DAYS_START = 0;
const DAYS_LENGTH = 19;
const SECONDS_START = DAYS_START + DAYS_LENGTH + 1;
const SECONDS_LENGTH = 12;
const NANOS_START = SECONDS_START + SECONDS_LENGTH;
const NANOS_LENGTH = 7;
function readDateTimeExtended(buffer) {
  const days = parseBigInt(buffer.slice(DAYS_START, DAYS_START + DAYS_LENGTH));
  const seconds = parseBigInt(buffer.slice(SECONDS_START, SECONDS_START + SECONDS_LENGTH));
  const nanos = parseBigInt(buffer.slice(NANOS_START, NANOS_START + NANOS_LENGTH)) * 100n;
  return format(days, seconds, nanos);
}
function parseBigInt(buffer) {
  return BigInt(buffer.toString("ascii"));
}
function format(days, seconds, nanos) {
  const date = /* @__PURE__ */ new Date(0);
  date.setUTCFullYear(1);
  date.setUTCDate(date.getUTCDate() + Number(days));
  date.setUTCSeconds(date.getUTCSeconds() + Number(seconds));
  let result = "";
  result += date.getFullYear().toString().padStart(4, "0");
  result += `.${(date.getUTCMonth() + 1).toString().padStart(2, "0")}`;
  result += `.${date.getUTCDate().toString().padStart(2, "0")}`;
  result += ` ${date.getUTCHours().toString().padStart(2, "0")}`;
  result += `:${date.getUTCMinutes().toString().padStart(2, "0")}`;
  result += `:${date.getUTCSeconds().toString().padStart(2, "0")}`;
  result += `.${nanos.toString().padStart(9, "0")}`;
  return result;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  readDateTimeExtended
});
