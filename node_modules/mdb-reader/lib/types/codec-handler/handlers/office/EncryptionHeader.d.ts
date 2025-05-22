/// <reference types="node" resolution-mode="require"/>
import { type CryptoAlgorithm } from "./CryptoAlgorithm.js";
import { type HashAlgorithm } from "./HashAlgorithm.js";
export declare const EncryptionHeaderFlags: {
    FCRYPTO_API_FLAG: number;
    FDOC_PROPS_FLAG: number;
    FEXTERNAL_FLAG: number;
    FAES_FLAG: number;
};
export interface EncryptionHeader {
    readonly cryptoAlgorithm: CryptoAlgorithm;
    readonly keySize: number;
    readonly hashAlgorithm: HashAlgorithm;
}
export declare function parseEncryptionHeader(buffer: Buffer, validCryptoAlgorithms: CryptoAlgorithm[], validHashAlgorithm: HashAlgorithm[]): EncryptionHeader;
export declare function isFlagSet(flagValue: number, flagMask: number): boolean;
