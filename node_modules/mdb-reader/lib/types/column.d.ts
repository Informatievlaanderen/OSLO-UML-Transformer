import { type ColumnType } from "./types.js";
export interface Column {
    /**
     * Name of the table
     */
    name: string;
    /**
     * Type of the table
     */
    type: ColumnType;
    size: number;
    fixedLength: boolean;
    nullable: boolean;
    autoLong: boolean;
    autoUUID: boolean;
    /**
     * Only exists if type = 'numeric'
     */
    precision?: number;
    /**
     * Only exists if type = 'numeric'
     */
    scale?: number;
}
/**
 * Includes internal fields that are not relevant for the user of the library.
 */
export interface ColumnDefinition extends Column {
    index: number;
    variableIndex: number;
    fixedIndex: number;
}
/**
 * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/include/mdbtools.h#L88-L104
 * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/HACKING#L498-L515
 */
export declare function getColumnType(typeValue: number): ColumnType;
/**
 * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/HACKING#L481-L491
 */
export declare function parseColumnFlags(flags: number): Pick<Column, "fixedLength" | "nullable" | "autoLong" | "autoUUID">;
