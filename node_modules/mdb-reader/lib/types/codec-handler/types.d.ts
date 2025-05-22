/// <reference types="node" resolution-mode="require"/>
export interface CodecHandler {
    decryptPage: DecryptPage;
    verifyPassword: VerifyPassword;
}
export type DecryptPage = (pageBuffer: Buffer, pageIndex: number) => Buffer;
export type VerifyPassword = () => boolean;
