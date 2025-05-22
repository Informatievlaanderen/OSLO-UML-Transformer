import type { Quad } from '@rdfjs/types';
import { WrappingIterator } from 'asynciterator';
/**
 * An iterator that emits prefixes on the first read call where prefixes are available
 */
export declare class PrefixWrappingIterator extends WrappingIterator<Quad> {
    private prefixes?;
    constructor(source: Promise<Quad[] & {
        prefixes: Record<string, string>;
    }> | undefined);
    read(): Quad | null;
}
