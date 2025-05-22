/// <reference types="node" resolution-mode="require"/>
import type { CodecHandler } from "../../types.js";
export declare function createRC4CryptoAPICodecHandler(encodingKey: Buffer, encryptionProvider: Buffer, password: Buffer): CodecHandler;
