import type { Quad, Store } from 'n3';

/**
 * Writes the triples in an RDF store to a write stream
 */
export interface IOutputHandler {
  write: (store: Store<Quad>, writeStream: any) => Promise<void>;
}
