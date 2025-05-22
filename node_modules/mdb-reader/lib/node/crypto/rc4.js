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
var rc4_exports = {};
__export(rc4_exports, {
  createRC4Decrypter: () => createRC4Decrypter,
  decryptRC4: () => decryptRC4
});
module.exports = __toCommonJS(rc4_exports);
function decryptRC4(key, data) {
  const decrypt = createRC4Decrypter(key);
  return decrypt(data);
}
function createRC4Decrypter(key) {
  const S = createKeyStream(key);
  let i = 0;
  let j = 0;
  return (data) => {
    const resultBuffer = Buffer.from(data);
    for (let k = 0; k < data.length; ++k) {
      i = (i + 1) % 256;
      j = (j + S[i]) % 256;
      [S[i], S[j]] = [S[j], S[i]];
      resultBuffer[k] ^= S[(S[i] + S[j]) % 256];
    }
    return resultBuffer;
  };
}
function createKeyStream(key) {
  const S = new Uint8Array(256);
  for (let i = 0; i < 256; ++i) {
    S[i] = i;
  }
  let j = 0;
  for (let i = 0; i < 256; ++i) {
    j = (j + S[i] + key[i % key.length]) % 256;
    [S[i], S[j]] = [S[j], S[i]];
  }
  return S;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createRC4Decrypter,
  decryptRC4
});
