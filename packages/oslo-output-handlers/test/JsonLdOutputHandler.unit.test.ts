/**
 * @group unit
 */
import * as N3 from 'n3';
import { DataFactory } from 'rdf-data-factory';
import { JsonLdOutputHandler } from '../lib/JsonLdOutputHandler';

describe('JsonLdOutputHandler', () => {
  let store: N3.Store;
  let df: DataFactory;
  let outputHandler: JsonLdOutputHandler;

  beforeEach(() => {
    store = new N3.Store();
    df = new DataFactory();
    outputHandler = new JsonLdOutputHandler();
  });
});
