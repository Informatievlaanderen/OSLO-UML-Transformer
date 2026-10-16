/**
 * @group unit
 */
import 'reflect-metadata';
import { QuadStore, ns } from '@oslo-flanders/core';
import { VoidLogger } from '@oslo-flanders/core/lib/logging/VoidLogger';
import type { DataRegistry, EaElement } from '@oslo-flanders/ea-uml-extractor';
import { EaAttribute, ElementType } from '@oslo-flanders/ea-uml-extractor';
import { DataFactory } from 'rdf-data-factory';
import { EaUmlConverterConfiguration } from '../lib/config/EaUmlConverterConfiguration';
import { AttributeConverterHandler } from '../lib/converter-handlers/AttributeConverterHandler';
import type { UriRegistry } from '../lib/UriRegistry';
import { addConceptAttributesToEnumerations } from '../lib/utils/conceptAttributes';

describe('Concept attributes on enumerations', () => {
  const df = new DataFactory();
  let handler: AttributeConverterHandler;
  let store: QuadStore;
  let model: DataRegistry;
  let uriRegistry: UriRegistry;
  let literal: EaAttribute;

  const createEnumeration = (id: number, name: string): EaElement =>
    <EaElement>(<unknown>{
      id,
      name,
      type: ElementType.Enumeration,
      path: `TestPackage:${name}`,
      eaGuid: `{guid-${id}}`,
      osloGuid: `guid-${id}`,
      packageId: 1,
      tags: [],
    });

  beforeEach(() => {
    const config = new EaUmlConverterConfiguration();
    (<any>config)._publicationEnvironment = 'https://example.org/';

    handler = new AttributeConverterHandler();
    (<any>handler).config = config;
    (<any>handler).logger = new VoidLogger();
    store = new QuadStore();

    // An enumeration value as Enterprise Architect stores it: an attribute of the enumeration
    literal = new EaAttribute(
      100,
      'Euro6',
      '{guid-literal}',
      1,
      '',
      '1',
      '1',
      '',
    );
    literal.path = 'TestPackage:Euronorm:Euro6';

    model = <DataRegistry>(<unknown>{
      elements: [
        createEnumeration(1, 'Euronorm'),
        createEnumeration(2, 'NotOnDiagram'),
      ],
      attributes: [literal],
      targetDiagram: { elementIds: [1], packageId: 1, name: 'TestDiagram' },
    });

    uriRegistry = <UriRegistry>(<unknown>{
      packageIdUriMap: new Map([[1, new URL('https://example.org/ns/')]]),
    });
  });

  async function convert(): Promise<void> {
    await handler.assignUris(model, uriRegistry);
    await handler.convert(model, uriRegistry, store);
  }

  // The assigned URIs of all attributes with the given enumeration as domain, sorted
  function attributeUrisOf(enumerationId: number): string[] {
    return store
      .findSubjects(
        ns.rdfs('domain'),
        df.namedNode(`urn:oslo-toolchain:guid-${enumerationId}`),
      )
      .map((subject) => store.getAssignedUri(subject)!.value)
      .sort();
  }

  it('should add code and voorkeursnaam to an enumeration on the diagram', async () => {
    addConceptAttributesToEnumerations(model);
    await convert();

    expect(attributeUrisOf(1)).toEqual([
      'http://www.w3.org/2004/02/skos/core#notation',
      'http://www.w3.org/2004/02/skos/core#prefLabel',
    ]);
  });

  it('should not add attributes to an enumeration that is not on the diagram', async () => {
    addConceptAttributesToEnumerations(model);
    await convert();

    expect(attributeUrisOf(2)).toEqual([]);
  });

  it('should still leave out the values of an enumeration', async () => {
    addConceptAttributesToEnumerations(model);
    await convert();

    expect(
      store.findQuads(
        df.namedNode(`urn:oslo-toolchain:${literal.osloGuid}`),
        null,
        null,
      ),
    ).toEqual([]);
  });

  it('should not add attributes when they are not requested', async () => {
    await convert();

    expect(attributeUrisOf(1)).toEqual([]);
  });
});
