/// <reference types="node" resolution-mode="require"/>
import type { Column } from "../column.js";
import { Database } from "../Database.js";
/**
 * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/src/libmdb/data.c#L626-L688
 */
export declare function readOLE(buffer: Buffer, _col: Column, database: Database): Buffer;
