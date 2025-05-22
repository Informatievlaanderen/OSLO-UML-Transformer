/// <reference types="node" resolution-mode="require"/>
export declare const ColumnTypes: {
    readonly Boolean: "boolean";
    readonly Byte: "byte";
    readonly Integer: "integer";
    readonly Long: "long";
    readonly Currency: "currency";
    readonly Float: "float";
    readonly Double: "double";
    readonly DateTime: "datetime";
    readonly Binary: "binary";
    readonly Text: "text";
    readonly OLE: "ole";
    readonly Memo: "memo";
    readonly RepID: "repid";
    readonly Numeric: "numeric";
    readonly Complex: "complex";
    readonly BigInt: "bigint";
    readonly DateTimeExtended: "datetimextended";
};
export type ColumnType = typeof ColumnTypes[keyof typeof ColumnTypes];
export type ValueMap = {
    [ColumnTypes.Binary]: Buffer;
    [ColumnTypes.BigInt]: bigint;
    [ColumnTypes.Boolean]: boolean;
    [ColumnTypes.Byte]: number;
    [ColumnTypes.Complex]: number;
    [ColumnTypes.Currency]: string;
    [ColumnTypes.DateTime]: Date;
    [ColumnTypes.DateTimeExtended]: string;
    [ColumnTypes.Double]: number;
    [ColumnTypes.Float]: number;
    [ColumnTypes.Integer]: number;
    [ColumnTypes.Long]: number;
    [ColumnTypes.Memo]: string;
    [ColumnTypes.Numeric]: string;
    [ColumnTypes.OLE]: Buffer;
    [ColumnTypes.RepID]: string;
    [ColumnTypes.Text]: string;
};
export type Value = ValueMap[keyof ValueMap] | null;
export interface SortOrder {
    value: number;
    version: number;
}
