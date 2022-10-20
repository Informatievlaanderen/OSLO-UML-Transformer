import { DataRegistry } from "@oslo-flanders/ea-uml-extractor";
import type * as RDF from '@rdfjs/types';
import { OsloUriRegistry } from "../UriRegistry";

export interface IConverterHandler<T> {
  /**
   * Creates RDF.Quads for objects with type T in the normalized model and adds them to an RDF.Store
   */
  convert: (normalizedModel: DataRegistry, uriRegistry: OsloUriRegistry, store: RDF.Store) => Promise<RDF.Store>;

  /**
   * Normalizes objects with type T in the data model
   */
  normalize: (model: DataRegistry) => Promise<DataRegistry>;

  /**
   * Assigns URIs to objects with type T in the data model and adds them to the URI registry
   */
  assignUris: (normalizedModel: DataRegistry, uriRegistry: OsloUriRegistry) => Promise<OsloUriRegistry>;

  /**
   * Creates and returns quads for an object with type T
   */
  createQuads: (object: T) => RDF.Quad[];
}