/// <reference types="node" resolution-mode="require"/>
import type { ColumnDefinition } from "../column.js";
import { Database } from "../Database.js";
import { type Value } from "../types.js";
export declare function readFieldValue(buffer: Buffer, column: ColumnDefinition, database: Database): Value | undefined;
