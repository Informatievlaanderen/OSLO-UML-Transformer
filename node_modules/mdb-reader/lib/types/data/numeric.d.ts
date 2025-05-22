/// <reference types="node" resolution-mode="require"/>
import type { Column } from "../column.js";
/**
 * @see https://github.com/mdbtools/mdbtools/blob/c3df30837ec2439d18c5515906072dc3306c0795/src/libmdb/money.c#L77-L100
 */
export declare function readNumeric(buffer: Buffer, column: Pick<Column, "scale" | "precision">): string;
