import { IConfiguration } from "./IConfiguration";
import type * as N3 from 'n3';

/**
 * Writes the triples in an RDF store to a file in a configurable format
 */
export interface IOutputHandler {
  configuration: IConfiguration;
  write: (store: N3.Store) => Promise<void>;
}