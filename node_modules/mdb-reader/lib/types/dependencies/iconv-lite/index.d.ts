/// <reference types="node" resolution-mode="require"/>
/**
 * Decodes CP1252 / windows 1252
 *
 * @see https://github.com/ashtuchkin/iconv-lite/blob/928f7c68e1be51c1391c70dbee244fd32623f121/encodings/sbcs-codec.js#L58-L69
 */
export declare function decodeWindows1252(buffer: Buffer): string;
