/// <reference types="node" resolution-mode="require"/>
import type { Cipher } from "./types.js";
export declare function blockDecrypt(cipher: Cipher, key: Buffer, iv: Buffer, data: Buffer): Buffer;
