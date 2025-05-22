/// <reference types="node" resolution-mode="require"/>
import { type JetFormat } from "./JetFormat/index.js";
import type { SortOrder } from "./types.js";
export declare class Database {
    #private;
    constructor(buffer: Buffer, password: string);
    get format(): JetFormat;
    getPassword(): string | null;
    getCreationDate(): Date | null;
    getDefaultSortOrder(): Readonly<SortOrder>;
    getPage(page: number): Buffer;
    /**
     * @param pageRow Lower byte contains the row number, the upper three contain page
     *
     * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/src/libmdb/data.c#L102-L124
     */
    findPageRow(pageRow: number): Buffer;
    /**
     * @param pageBuffer Buffer of a data page
     *
     * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/src/libmdb/data.c#L126-L138
     */
    findRow(pageBuffer: Buffer, row: number): Buffer;
}
