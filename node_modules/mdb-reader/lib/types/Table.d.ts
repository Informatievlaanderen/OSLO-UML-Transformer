import { type Column } from "./column.js";
import { Database } from "./Database.js";
import type { Value } from "./types.js";
export declare class Table {
    #private;
    /**
     * @param name Table name. As this is stored in a MSysObjects, it has to be passed in
     * @param database
     * @param firstDefinitionPage The first page of the table definition referenced in the corresponding MSysObject
     */
    constructor(name: string, database: Database, firstDefinitionPage: number);
    get name(): string;
    get rowCount(): number;
    get columnCount(): number;
    /**
     * Returns a column definition by its name.
     *
     * @param name Name of the column. Case sensitive.
     */
    getColumn(name: string): Column;
    /**
     * Returns an ordered array of all column definitions.
     */
    getColumns(): Column[];
    /**
     * Returns an ordered array of all column names.
     */
    getColumnNames(): string[];
    /**
     * Returns data from the table.
     *
     * @param columns Columns to be returned. Defaults to all columns.
     * @param rowOffset Index of the first row to be returned. 0-based. Defaults to 0.
     * @param rowLimit Maximum number of rows to be returned. Defaults to Infinity.
     */
    getData<TRow extends {
        [column in TColumn]: Value;
    }, TColumn extends string = string>(options?: {
        columns?: ReadonlyArray<string> | undefined;
        rowOffset?: number | undefined;
        rowLimit?: number | undefined;
    } | undefined): TRow[];
}
