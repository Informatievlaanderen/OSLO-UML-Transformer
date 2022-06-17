// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-empty-function */
import { DataFactory } from 'rdf-data-factory';
import { OutputHandler } from '../../lib/interfaces/OutputHandler';

class MockOutputHandler extends OutputHandler {
  public async write(path: string): Promise<void> { }
}

describe('OutputHandler', () => {
  const dataFactory = new DataFactory();

  let outputHandler: MockOutputHandler;

  beforeEach(() => {
    outputHandler = new MockOutputHandler();
  });

  it('should add one or multiple RDF.Quads to an N3.Store', async () => {
    outputHandler.add(
      dataFactory.namedNode('http://example.org/id/test1'),
      dataFactory.namedNode('http://example.org/predicate/1'),
      dataFactory.namedNode('http://example.org/object/1'),
    );

    expect((<any>outputHandler).store.countQuads(null, null, null, null)).toBe(1);
    outputHandler = new MockOutputHandler();

    outputHandler.add(
      dataFactory.namedNode('http://example.org/id/test2'),
      dataFactory.namedNode('http://example.org/predicate/2'),
      [dataFactory.namedNode('http://example.org/object/2'), dataFactory.namedNode('http://example.org/object/3')],
    );

    expect((<any>outputHandler).store.countQuads(null, null, null, null)).toBe(2);
  });

  it('should indicate whether a RDF.Quad exists or not', async () => {
    outputHandler.add(
      dataFactory.namedNode('http://example.org/id/test1'),
      dataFactory.namedNode('http://example.org/predicate/1'),
      dataFactory.namedNode('http://example.org/object/1'),
    );

    expect(outputHandler.quadExists(dataFactory.namedNode('http://example.org/id/test1'),
      dataFactory.namedNode('http://example.org/predicate/1'))).toBe(true);
    expect(outputHandler.quadExists(dataFactory.namedNode('http://example.org/id/test2'),
      dataFactory.namedNode('http://example.org/predicate/2'))).toBe(false);
  });
});
