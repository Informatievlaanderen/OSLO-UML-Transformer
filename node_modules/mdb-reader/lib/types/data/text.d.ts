/// <reference types="node" resolution-mode="require"/>
import type { Column } from "../index.js";
import { Database } from "../Database.js";
export declare function readText(buffer: Buffer, _col: Column, database: Database): string;
