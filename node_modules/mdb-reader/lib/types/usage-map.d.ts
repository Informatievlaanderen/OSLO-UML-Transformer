/// <reference types="node" resolution-mode="require"/>
import { Database } from "./Database.js";
/**
 * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/HACKING#L556-L622
 */
export declare function findMapPages(buffer: Buffer, database: Database): number[];
