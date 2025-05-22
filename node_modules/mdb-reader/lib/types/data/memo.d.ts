/// <reference types="node" resolution-mode="require"/>
import type { Column } from "../index.js";
import { Database } from "../Database.js";
/**
 * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/src/libmdb/data.c#L690-L776
 */
export declare function readMemo(buffer: Buffer, _col: Column, database: Database): string;
