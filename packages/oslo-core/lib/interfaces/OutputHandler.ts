import type * as RDF from '@rdfjs/types';
import * as N3 from 'n3';
import { DataFactory } from 'rdf-data-factory';
import { getLoggerFor } from '../logging/LogUtil';

type RdfObjectTypes = RDF.NamedNode | RDF.NamedNode[] | RDF.Literal | RDF.Literal[];

/**
 * Writes the converted data in an RDF serialized format to a file.
 * The data in the file must be compliant with the agreements
 * made regarding the intermediate format.
 */
export abstract class OutputHandler {
  protected readonly logger = getLoggerFor(this);
  protected readonly store: N3.Store;
  public readonly factory: DataFactory;

  public constructor() {
    this.store = new N3.Store();
    this.factory = new DataFactory();
  }

  public abstract write(path: string): Promise<void>;

  public add(subject: RDF.NamedNode, predicate: RDF.NamedNode, object: RdfObjectTypes, graph?: RDF.NamedNode): void {
    if (Array.isArray(object)) {
      return object.forEach(x => this.store.addQuad(subject, predicate, x, graph));
    }

    this.store.addQuad(subject, predicate, object, graph);
  }

  public quadExists(subject: RDF.NamedNode, predicate: RDF.NamedNode): boolean {
    return this.store.countQuads(subject, predicate, null, null) > 0;
  }
}
