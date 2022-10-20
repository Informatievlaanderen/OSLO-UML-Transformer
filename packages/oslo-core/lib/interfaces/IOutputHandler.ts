import { IConfiguration } from "./IConfiguration";
import type * as RDF from '@rdfjs/types';

/**
 * Writes the triples in an RDF store to a file in a configurable format
 */
export interface IOutputHandler {
  configuration: IConfiguration;
  write: (store: RDF.Store) => Promise<void>;
}