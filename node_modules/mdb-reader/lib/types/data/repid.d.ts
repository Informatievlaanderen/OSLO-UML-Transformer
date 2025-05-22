/// <reference types="node" resolution-mode="require"/>
/**
 * Read replication ID
 *
 * @see https://github.com/mdbtools/mdbtools/blob/c3df30837ec2439d18c5515906072dc3306c0795/src/libmdb/data.c#L958-L972
 */
export declare function readRepID(buffer: Buffer): string;
