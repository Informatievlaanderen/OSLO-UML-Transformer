/**
 * @group unit
 */
import { QuadStore, ns } from '@oslo-flanders/core';
import { DataFactory } from 'rdf-data-factory';
import { JsonLdOutputHandler } from '../lib/output-handlers/JsonLdOutputHandler';
import { getOsloContext } from '../lib/utils/osloContext';

describe('JsonLdOutputHandler', () => {
  let store: QuadStore;
  let df: DataFactory;
  let outputHandler: JsonLdOutputHandler;

  beforeEach(() => {
    store = new QuadStore();
    df = new DataFactory();
    outputHandler = new JsonLdOutputHandler();
  });

  it('should write the quads in the quad store to a JSON-LD document', async () => {
    const writeStream: any = {};
    writeStream.write = jest.fn();

    jest.spyOn(<any>outputHandler, 'getPackages');
    jest.spyOn(<any>outputHandler, 'getClasses');
    jest.spyOn(<any>outputHandler, 'getAttributes');
    jest.spyOn(<any>outputHandler, 'getDatatypes');
    jest.spyOn(<any>outputHandler, 'getReferencedEntities');
    jest
      .spyOn(<any>outputHandler, 'addDocumentInformation')
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .mockImplementationOnce(() => { });

    jest.mock('../lib/utils/osloContext', () => {
      return {
        getOsloContext: jest.fn(),
      };
    });

    const document: any = {};
    document['@context'] = getOsloContext();
    document.packages = [];
    document.classes = [];
    document.attributes = [];
    document.datatypes = [];
    document.referencedEntities = [];

    await outputHandler.write(store, writeStream);
    expect(writeStream.write).toHaveBeenCalledWith(
      JSON.stringify(document, null, 2),
    );
  });

  it('should add version id and the timestamp to the document', async () => {
    const quads = [
      df.quad(
        df.namedNode('http://example.org/id/version/1'),
        ns.prov('generatedAtTime'),
        df.literal(new Date().toISOString()),
      ),
    ];

    store.addQuads(quads);
    const document: any = {};

    (<any>outputHandler).addDocumentInformation(document, store);

    expect(document['@id']).toBe('http://example.org/id/version/1');
    expect(document.generatedAtTime).toBeDefined();
  });

  it('should throw an error when the version id can not be found', async () => {
    expect(() =>
      (<any>outputHandler).addDocumentInformation({}, store)).toThrowError();
  });

  it('should get all packages from the quad store and return a JSON-LD object', async () => {
    const quads = [
      df.quad(
        df.namedNode('http://example.org/id/package/A'),
        ns.rdf('type'),
        ns.oslo('Package'),
      ),
      df.quad(
        df.namedNode('http://example.org/id/package/A'),
        ns.oslo('baseURI'),
        df.namedNode('http://example.org/ns/A#'),
      ),
      df.quad(
        df.namedNode('http://example.org/id/package/A'),
        ns.oslo('assignedURI'),
        df.namedNode('http://example.org/ns/A'),
      ),
    ];

    store.addQuads(quads);
    const packageObject = (
      await (<any>outputHandler).getPackages(store)
    ).shift();

    expect(packageObject).toEqual({
      '@id': 'http://example.org/id/package/A',
      '@type': 'Package',
      assignedURI: 'http://example.org/ns/A',
      baseURI: 'http://example.org/ns/A#',
    });
  });

  it('should throw an error when a package has no base URI defined', async () => {
    const quads = [
      df.quad(
        df.namedNode('http://example.org/id/package/A'),
        ns.rdf('type'),
        ns.oslo('Package'),
      ),
      df.quad(
        df.namedNode('http://example.org/id/package/A'),
        ns.oslo('assignedUri'),
        df.namedNode('http://example.org/ns/A#'),
      ),
    ];

    store.addQuads(quads);
    await expect(
      (<any>outputHandler).getPackages(store),
    ).rejects.toThrowError();
  });

  it('should get all classes from the quad store and return an array of JSON-LD objects', async () => {
    const quads = [
      df.quad(
        df.namedNode('urn:oslo-toolchain:1'),
        ns.rdf('type'),
        ns.owl('Class'),
      ),
      df.quad(
        df.namedNode('urn:oslo-toolchain:1'),
        ns.oslo('assignedURI'),
        df.namedNode('http://example.org/id/class/1'),
      ),
      df.quad(
        df.namedNode('urn:oslo-toolchain:1'),
        ns.oslo('vocLabel'),
        df.literal('TestClass', 'en'),
      ),
      df.quad(
        df.namedNode('urn:oslo-toolchain:1'),
        ns.oslo('vocDefinition'),
        df.literal('A definition', 'en'),
      ),
      df.quad(
        df.namedNode('urn:oslo-toolchain:1'),
        ns.oslo('scope'),
        df.namedNode('http://example.org/id/scope/A'),
      ),
      df.quad(
        df.namedNode('urn:oslo-toolchain:1'),
        ns.rdfs('subClassOf'),
        df.namedNode('http://example.org/id/class/B'),
      ),
    ];

    store.addQuads(quads);
    const classObject = (await (<any>outputHandler).getClasses(store)).shift();

    expect(classObject).toEqual({
      '@id': 'urn:oslo-toolchain:1',
      '@type': 'Class',
      assignedURI: 'http://example.org/id/class/1',
      vocDefinition: [
        {
          '@language': 'en',
          '@value': 'A definition',
        },
      ],
      vocLabel: [
        {
          '@language': 'en',
          '@value': 'TestClass',
        },
      ],
      scope: 'http://example.org/id/scope/A',
      parent: [
        {
          '@id': 'http://example.org/id/class/B',
        },
      ],
    });
  });

  // TODO: create an extra test when the handler has a logger and there is no assigned URI
  it('should skip, but log an error message when a class has no assigned URI', async () => {
    const quads = [
      df.quad(
        df.namedNode('urn:oslo-toolchain:1'),
        ns.rdf('type'),
        ns.owl('Class'),
      ),
    ];

    store.addQuads(quads);
    const classObjects = await (<any>outputHandler).getClasses(store);

    expect(classObjects.length).toBe(0);
    // TODO: add extra test to check if the logger was called
  });

  it('should get all attributes from the quad store and return an array of JSON-LD objects', async () => {
    const quads = [
      df.quad(
        df.namedNode('urn:oslo-toolchain:property:1'),
        ns.rdf('type'),
        ns.owl('DatatypeProperty'),
      ),
      df.quad(
        df.namedNode('urn:oslo-toolchain:property:1'),
        ns.oslo('assignedURI'),
        df.namedNode('http://example.org/id/property/1'),
      ),
      df.quad(
        df.namedNode('urn:oslo-toolchain:property:1'),
        ns.oslo('vocDefinition'),
        df.literal('A definition', 'en'),
      ),
      df.quad(
        df.namedNode('urn:oslo-toolchain:property:1'),
        ns.oslo('vocLabel'),
        df.literal('A label', 'en'),
      ),
      df.quad(
        df.namedNode('urn:oslo-toolchain:property:1'),
        ns.oslo('vocUsageNote'),
        df.literal('A usage note', 'en'),
      ),
      df.quad(
        df.namedNode('urn:oslo-toolchain:property:1'),
        ns.rdfs('domain'),
        df.namedNode('urn:oslo-toolchain:class:1'),
      ),
      df.quad(
        df.namedNode('urn:oslo-toolchain:property:1'),
        ns.rdfs('range'),
        ns.rdfs('Literal'),
      ),
      df.quad(
        df.namedNode('urn:oslo-toolchain:property:1'),
        ns.oslo('scope'),
        df.namedNode('http://example.org/id/scope/A'),
      ),
      df.quad(
        df.namedNode('urn:oslo-toolchain:property:1'),
        ns.shacl('maxCount'),
        df.literal('1', ns.xsd('integer')),
      ),
      df.quad(
        df.namedNode('urn:oslo-toolchain:property:1'),
        ns.shacl('minCount'),
        df.literal('1', ns.xsd('integer')),
      ),
      df.quad(
        df.namedNode('urn:oslo-toolchain:property:1'),
        ns.rdfs('subPropertyOf'),
        df.namedNode('http://example.org/id/property/2'),
      ),
    ];

    store.addQuads(quads);
    const propertyObjects = await (<any>outputHandler).getAttributes(store);

    expect(propertyObjects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          '@id': 'urn:oslo-toolchain:property:1',
          '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
          assignedURI: 'http://example.org/id/property/1',
          vocLabel: [
            {
              '@language': 'en',
              '@value': 'A label',
            },
          ],
          vocDefinition: [
            {
              '@language': 'en',
              '@value': 'A definition',
            },
          ],
          vocUsageNote: [
            {
              '@language': 'en',
              '@value': 'A usage note',
            },
          ],
          domain: {
            '@id': 'urn:oslo-toolchain:class:1',
          },
          range: {
            '@id': ns.rdfs('Literal').value,
          },
          parent: {
            '@id': 'http://example.org/id/property/2',
          },
          minCount: { '@value': '1', '@type': 'http://www.w3.org/2001/XMLSchema#integer' },
          maxCount: { '@value': '1', '@type': 'http://www.w3.org/2001/XMLSchema#integer' },
          scope: 'http://example.org/id/scope/A',
        }),
      ]),
    );
  });

  it('should get all data types from the quad store and return an array of JSON-LD objects', async () => {
    const quads = [
      df.quad(
        df.namedNode('urn:oslo-toolchain:1'),
        ns.rdf('type'),
        ns.rdfs('Datatype'),
      ),
      df.quad(
        df.namedNode('urn:oslo-toolchain:1'),
        ns.oslo('assignedURI'),
        df.namedNode('http://example.org/id/dataType/1'),
      ),
      df.quad(
        df.namedNode('urn:oslo-toolchain:1'),
        ns.oslo('vocDefinition'),
        df.literal('A definition', 'en'),
      ),
      df.quad(
        df.namedNode('urn:oslo-toolchain:1'),
        ns.oslo('vocLabel'),
        df.literal('A label', 'en'),
      ),
      df.quad(
        df.namedNode('urn:oslo-toolchain:1'),
        ns.oslo('vocUsageNote'),
        df.literal('A usage note', 'en'),
      ),
      df.quad(
        df.namedNode('urn:oslo-toolchain:1'),
        ns.oslo('scope'),
        df.namedNode('http://example.org/id/scope/A'),
      ),
    ];

    store.addQuads(quads);
    const datatypeObjects = await (<any>outputHandler).getDatatypes(store);

    expect(datatypeObjects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          '@id': 'urn:oslo-toolchain:1',
          '@type': 'Datatype',
          assignedURI: 'http://example.org/id/dataType/1',
          vocLabel: [
            {
              '@language': 'en',
              '@value': 'A label',
            },
          ],
          vocDefinition: [
            {
              '@language': 'en',
              '@value': 'A definition',
            },
          ],
          vocUsageNote: [
            {
              '@language': 'en',
              '@value': 'A usage note',
            },
          ],
          scope: 'http://example.org/id/scope/A',
        }),
      ]),
    );
  });

  it('should get all entities that are in the referenced entities graph', async () => {
    const quads = [
      df.quad(
        df.namedNode('urn:oslo-toolchain:1'),
        ns.rdf('type'),
        ns.owl('Class'),
        df.namedNode('referencedEntities'),
      ),
    ];

    store.addQuads(quads);
    const referencedEntities = await (<any>outputHandler).getReferencedEntities(store);

    expect(referencedEntities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          '@id': 'urn:oslo-toolchain:1',
          '@type': ns.owl('Class').value,
        }),
      ]),
    );
  });

  it('should transform label quads to a JSON object', async () => {
    const quads = [
      df.quad(
        df.namedNode('urn:oslo-toolchain:1'),
        ns.oslo('vocLabel'),
        df.literal('A vocabulary label', 'en'),
      ),
      df.quad(
        df.namedNode('urn:oslo-toolchain:1'),
        ns.oslo('apLabel'),
        df.literal('An application profile label', 'en'),
      ),
      df.quad(
        df.namedNode('urn:oslo-toolchain:1'),
        ns.oslo('diagramLabel'),
        df.literal('A diagram label'),
      ),
    ];

    const labelObject = (<any>outputHandler).mapLabels(quads);

    expect(labelObject).toEqual(
      expect.objectContaining({
        vocLabel: [
          {
            '@language': 'en',
            '@value': 'A vocabulary label',
          },
        ],
        apLabel: [
          {
            '@language': 'en',
            '@value': 'An application profile label',
          },
        ],
        diagramLabel: [
          {
            '@value': 'A diagram label',
          },
        ],
      }),
    );
  });

  it('should transform definition quads to a JSON object', async () => {
    const quads = [
      df.quad(
        df.namedNode('urn:oslo-toolchain:1'),
        ns.oslo('vocDefinition'),
        df.literal('A vocabulary definition', 'en'),
      ),
      df.quad(
        df.namedNode('urn:oslo-toolchain:1'),
        ns.oslo('apDefinition'),
        df.literal('An application profile definition', 'en'),
      ),
    ];

    const definitionObject = (<any>outputHandler).mapDefinitions(quads);

    expect(definitionObject).toEqual(
      expect.objectContaining({
        vocDefinition: [
          {
            '@language': 'en',
            '@value': 'A vocabulary definition',
          },
        ],
        apDefinition: [
          {
            '@language': 'en',
            '@value': 'An application profile definition',
          },
        ],
      }),
    );
  });

  it('should transform usage note quads to a JSON object', async () => {
    const quads = [
      df.quad(
        df.namedNode('urn:oslo-toolchain:1'),
        ns.oslo('vocUsageNote'),
        df.literal('A vocabulary usage note', 'en'),
      ),
      df.quad(
        df.namedNode('urn:oslo-toolchain:1'),
        ns.oslo('apUsageNote'),
        df.literal('An application profile usage note', 'en'),
      ),
    ];

    const usageNoteObject = (<any>outputHandler).mapUsageNotes(quads);

    expect(usageNoteObject).toEqual(
      expect.objectContaining({
        vocUsageNote: [
          {
            '@language': 'en',
            '@value': 'A vocabulary usage note',
          },
        ],
        apUsageNote: [
          {
            '@language': 'en',
            '@value': 'An application profile usage note',
          },
        ],
      }),
    );
  });
});
