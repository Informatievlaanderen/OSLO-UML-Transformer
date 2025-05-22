import { Quad } from '@rdfjs/types';

export interface ParseOptions {
  extendedSyntax?: boolean;
  baseIRI?: string;
}

export declare function parse(str: string, options?: ParseOptions): Quad[] & { prefixes: Record<string, string> };
