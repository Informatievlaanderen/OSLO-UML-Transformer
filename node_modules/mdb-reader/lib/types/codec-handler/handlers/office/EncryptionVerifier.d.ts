/// <reference types="node" resolution-mode="require"/>
import type { CryptoAlgorithm } from "./CryptoAlgorithm.js";
export interface EncryptionVerifier {
    readonly salt: Buffer;
    readonly encryptionVerifier: Buffer;
    readonly encryptionVerifierHashSize: number;
    readonly encryptionVerifierHash: Buffer;
}
export declare function parseEncryptionVerifier(encryptionProvider: Buffer, cryptoAlgorithm: CryptoAlgorithm): EncryptionVerifier;
