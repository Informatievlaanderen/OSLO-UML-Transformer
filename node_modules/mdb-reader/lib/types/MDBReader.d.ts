/// <reference types="node" resolution-mode="require"/>
import { Table } from "./Table.js";
import type { SortOrder } from "./types.js";
export interface Options {
    password?: string | undefined;
}
export default class MDBReader {
    #private;
    /**
     * @param buffer Buffer of the database.
     */
    constructor(buffer: Buffer, { password }?: Options | undefined);
    /**
     * Date when the database was created
     */
    getCreationDate(): Date | null;
    /**
     * Database password
     */
    getPassword(): string | null;
    /**
     * Default sort order
     */
    getDefaultSortOrder(): Readonly<SortOrder>;
    /**
     * Returns an array of table names.
     *
     * @param normalTables Includes user tables. Default true.
     * @param systemTables Includes system tables. Default false.
     * @param linkedTables Includes linked tables. Default false.
     */
    getTableNames({ normalTables, systemTables, linkedTables, }?: {
        normalTables?: boolean | undefined;
        systemTables?: boolean | undefined;
        linkedTables?: boolean | undefined;
    }): string[];
    /**
     * Returns a table by its name.
     *
     * @param name Name of the table. Case sensitive.
     */
    getTable(name: string): Table;
}
