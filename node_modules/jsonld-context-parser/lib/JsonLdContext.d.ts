export type JsonLdContext = IJsonLdContext | string | (IJsonLdContext | string)[];
export interface IJsonLdContext {
    '@base'?: Uri | null;
    '@vocab'?: Uri | null;
    '@language'?: Language;
    [id: string]: any;
    '@version'?: number;
}
export interface IJsonLdContextNormalizedRaw {
    '@base'?: Uri | null;
    '@vocab'?: Uri | null;
    '@language'?: Language;
    [id: string]: any;
    '@version'?: number;
}
export type IPrefixValue = string | {
    '@id'?: Uri | Bnode;
    '@reverse'?: Uri | boolean;
    '@type'?: Types;
    '@container'?: Containers;
    '@value'?: string;
    '@context'?: JsonLdContext;
    '@prefix'?: boolean;
} | '@nest';
export type Uri = string;
export type Bnode = string;
export type Language = string;
export type Types = '@id' | Uri;
export type Containers = '@language' | '@list' | '@set' | '@index' | '@graph' | ['@index', '@set'] | ['@graph', '@index'] | '@language' | ['@language', '@set'] | '@id' | ['@id', '@set'] | ['@graph', '@id'] | '@type' | ['@type', '@set'];
