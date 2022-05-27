import * as N3 from 'n3';
import type * as RDF from '@rdfjs/types';
import { fetchFileOrUrl } from '../utils/fetchFileOrUrl';
import { Readable } from 'stream';
import { JsonLdParser } from 'jsonld-streaming-parser';
import { getLoggerFor } from '../logging/LogUtil';

/**
 * Generates a specification using the intermediary OSLO RDF file as input.
 * @description a generator can be implemented on RDF level, by initializing the store
 * or on JSON level, by passing the data as JSON to the generate function.
 */
export abstract class Generator<T> {
  protected readonly logger = getLoggerFor(this);
  private _configuration: T | undefined;
  private _store: N3.Store | undefined;

  public abstract generate(data?: any): Promise<void>;

  public get configuration(): T {
    if (!this._configuration) {
      throw new Error(`Configuration has not been set yet.`);
    }
    return this._configuration;
  }

  public set configuration(value: T) {
    this._configuration = value;
  }

  public get store(): N3.Store {
    if (!this._store) {
      throw new Error(`N3 Store in Generator has not been set yet`);
    }
    return this._store;
  }

  public async initStore(jsonLdFile: string, targetLanguage: string): Promise<void> {
    if (!this._store) {
      this._store = new N3.Store();

      const data = await fetchFileOrUrl(jsonLdFile);
      return new Promise((resolve, reject) => {
        Readable.from(data.toString())
          .pipe(new JsonLdParser())
          .on('data', (quad: RDF.Quad) => this.languageFilter(quad, targetLanguage))
          .on('error', reject)
          .on('end', resolve);
      });
    }
  }

  /**
   * Add RDF.Quads to an N3.Store after a language check has been applied.
   * Quads without a language tag will also be added to the store
   * @param quad - an RDF Quad
   * @param targetLanguage - language in which the specification must be rendered
   */
  private languageFilter(quad: RDF.Quad, targetLanguage: string): void {
    if (quad.object.termType === 'NamedNode' || (<RDF.Literal>quad.object).language === targetLanguage) {
      this.store.addQuad(quad);
    }
  }
}