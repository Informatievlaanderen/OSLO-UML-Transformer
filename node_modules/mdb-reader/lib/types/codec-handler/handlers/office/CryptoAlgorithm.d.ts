export interface CryptoAlgorithm {
    readonly id: number;
    readonly encryptionVerifierHashLength: number;
    readonly keySizeMin: number;
    readonly keySizeMax: number;
}
export declare const CRYPTO_ALGORITHMS: {
    EXTERNAL: CryptoAlgorithm;
    RC4: CryptoAlgorithm;
    AES_128: CryptoAlgorithm;
    AES_192: CryptoAlgorithm;
    AES_256: CryptoAlgorithm;
};
