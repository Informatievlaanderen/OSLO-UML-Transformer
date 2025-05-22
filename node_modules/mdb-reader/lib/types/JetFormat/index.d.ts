/// <reference types="node" resolution-mode="require"/>
import type { JetFormat } from "./types.js";
export type { JetFormat } from "./types.js";
/**
 * Returns the database format of the given buffer
 *
 * @param buffer Full buffer or buffer of first page
 *
 * @see https://github.com/mdbtools/mdbtools/blob/master/HACKING.md#database-definition-page
 * @see https://github.com/mdbtools/mdbtools/blob/7d10a50faf3ff89fbb09252c218eb3ca92f5b19c/include/mdbtools.h#L78-L86
 * @see https://github.com/mdbtools/mdbtools/blob/7d10a50faf3ff89fbb09252c218eb3ca92f5b19c/src/libmdb/file.c#L215-L232
 * @see https://github.com/jahlborn/jackcess/blob/a61e2da7fe9f76614013481c27a557455f080752/src/main/java/com/healthmarketscience/jackcess/impl/JetFormat.java
 */
export declare function getJetFormat(buffer: Buffer): JetFormat;
