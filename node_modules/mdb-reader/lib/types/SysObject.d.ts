/**
 * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/include/mdbtools.h#L73-L87
 */
export declare const SysObjectTypes: {
    Form: number;
    Table: number;
    Macro: number;
    SystemTable: number;
    Report: number;
    Query: number;
    LinkedTable: number;
    Module: number;
    Relationship: number;
    DatabaseProperty: number;
};
export type SysObjectType = typeof SysObjectTypes[keyof typeof SysObjectTypes];
export declare function isSysObjectType(typeValue: number): boolean;
export interface SysObject {
    objectName: string;
    /**
     * null = unknown
     */
    objectType: SysObjectType | null;
    tablePage: number;
    flags: number;
}
/**
 * @see https://github.com/jahlborn/jackcess/blob/3f75e95a21d9a9e3486519511cdd6178e3c2e3e4/src/main/java/com/healthmarketscience/jackcess/impl/DatabaseImpl.java#L194-L202
 */
export declare function isSystemObject(o: Pick<SysObject, "flags">): boolean;
