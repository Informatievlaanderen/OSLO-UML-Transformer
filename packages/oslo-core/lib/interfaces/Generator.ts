import { Readable } from 'stream';
import type * as RDF from '@rdfjs/types';
import { JsonLdParser } from 'jsonld-streaming-parser';
import * as N3 from 'n3';
import { getLoggerFor } from '../logging/LogUtil';

/**
 * Generates a specification using the intermediary OSLO RDF file as input.
 * @description a generator can be implemented on RDF level, by initializing the store
 * or on JSON level, by passing the data as JSON to the generate function.
 */
export abstract class Generator<T> {
  protected readonly logger = getLoggerFor(this);
  private _configuration: T | undefined;

  public abstract generate(data: string): Promise<void>;

  public async init(config: T): Promise<void> {
    this._configuration = config;
  }

  public get configuration(): T {
    if (!this._configuration) {
      throw new Error(`Configuration has not been set yet.`);
    }
    return this._configuration;
  }

  public async createRdfStore(data: string, targetLanguage: string): Promise<N3.Store> {
    const store = new N3.Store();

    await new Promise((resolve, reject) => {
      Readable.from(data)
        .pipe(new JsonLdParser())
        .on('data', (quad: RDF.Quad) => {
          if (this.matchesTargetLanguage(quad, targetLanguage)) {
            store.addQuad(quad.subject, quad.predicate, quad.object, quad.predicate);
          }
        })
        .on('error', reject)
        .on('end', resolve);
    });

    return store;
  }

  /**
   * Checks if the language of the object matches the target language
   * Quad wihtout a language tag will also return true
   * @param quad - an RDF Quad
   * @param targetLanguage - language in which the specification must be rendered
   */
  private matchesTargetLanguage(quad: RDF.Quad, targetLanguage: string): boolean {
    const isLiteral = quad.object.termType;

    if (isLiteral) {
      const literal = <RDF.Literal>quad.object;

      if (literal.language && literal.language !== targetLanguage) {
        return false;
      }
    }

    return true;
  }
}
