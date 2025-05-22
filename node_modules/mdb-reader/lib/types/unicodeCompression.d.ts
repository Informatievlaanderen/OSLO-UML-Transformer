/// <reference types="node" resolution-mode="require"/>
import type { JetFormat } from "./JetFormat/index.js";
/**
 * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/HACKING#L823-L831
 */
export declare function uncompressText(buffer: Buffer, format: Pick<JetFormat, "textEncoding">): string;
