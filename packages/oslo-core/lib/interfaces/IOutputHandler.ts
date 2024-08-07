import type { QuadStore } from '../store/QuadStore';

/**
 * Writes the triples in an RDF store to a write stream
 */
export interface IOutputHandler {
  write: (store: QuadStore, writeStream: any) => Promise<void>;
}
