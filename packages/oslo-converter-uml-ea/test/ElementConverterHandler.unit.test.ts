/**
 * @group unit
 */
import 'reflect-metadata';
import { QuadStore, ns } from '@oslo-flanders/core';
import { VoidLogger } from '@oslo-flanders/core/lib/logging/VoidLogger';
import type { DataRegistry, EaElement } from '@oslo-flanders/ea-uml-extractor';
import { ElementType } from '@oslo-flanders/ea-uml-extractor';
import { DataFactory } from 'rdf-data-factory';
import { EaUmlConverterConfiguration } from '../lib/config/EaUmlConverterConfiguration';
import { IgnoredUris } from '../lib/constants/IgnoredUris';
import { ElementConverterHandler } from '../lib/converter-handlers/ElementConverterHandler';
import type { UriRegistry } from '../lib/UriRegistry';

describe('ElementConverterHandler', () => {
  let handler: ElementConverterHandler;
  let logger: VoidLogger;
  let config: EaUmlConverterConfiguration;
  let store: QuadStore;
  let mockUriRegistry: UriRegistry;
  let mockDataRegistry: DataRegistry;
  const df = new DataFactory();

  // Helper function to create mock elements
  const createMockElement = (
    id: number,
    name: string,
    type: ElementType = ElementType.Class,
    path = `TestPackage::${name}`,
    tags: { tagName: string; tagValue: string }[] = [],
  ): EaElement => <EaElement>(<unknown>{
      id,
      name,
      type,
      path,
      osloGuid: `guid-${id}`,
      packageId: 1,
      tags,
    });

  beforeEach(() => {
    logger = new VoidLogger();
    jest.spyOn(logger, 'info');
    jest.spyOn(logger, 'warn');
    jest.spyOn(logger, 'error');

    store = new QuadStore();

    config = new EaUmlConverterConfiguration();

    handler = new ElementConverterHandler();
    (<any>handler).config = config;
    (<any>handler).logger = logger;

    mockUriRegistry = <UriRegistry>{
      elementIdUriMap: new Map(),
      packageIdUriMap: new Map(),
      fallbackBaseUri: 'http://example.org/',
    };

    mockDataRegistry = <DataRegistry>(<unknown>{
      elements: [],
      targetDiagram: {
        elementIds: [1, 2, 3],
        packageId: 1,
        name: 'TestDiagram',
      },
    });

    mockUriRegistry.packageIdUriMap.set(1, new URL('http://example.org/ns/'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('convert method with ignoreSkosConcept configuration', () => {
    it('should ignore SKOS Concept elements when ignoreSkosConcept is true', async () => {
      // IgnoreSkosConcept enabled
      (<any>config)._ignoreSkosConcept = true;

      const regularElement = createMockElement(1, 'RegularClass');
      const skosEnumeration = createMockElement(
        2,
        'SkosConceptEnumeration',
        ElementType.Enumeration,
      );

      mockDataRegistry.elements = [regularElement, skosEnumeration];

      mockUriRegistry.elementIdUriMap.set(
        1,
        new URL('http://example.org/id/class/1'),
      );
      mockUriRegistry.elementIdUriMap.set(2, new URL(IgnoredUris.SKOS_CONCEPT));

      jest
        .spyOn(handler, 'createQuads')
        .mockImplementation((element) => [
          df.quad(
            df.namedNode(`urn:oslo-toolchain:guid-${element.id}`),
            ns.rdf('type'),
            ns.owl('Class'),
          ),
        ]);

      const result = await handler.convert(
        mockDataRegistry,
        mockUriRegistry,
        store,
      );

      const quads = result.findQuads(null, null, null);
      expect(quads).toHaveLength(1);
      expect(quads[0].subject.value).toBe('urn:oslo-toolchain:guid-1');

      expect(logger.info).toHaveBeenCalledWith(
        `[ElementConverterHandler]: Ignoring SKOS Concept element (${skosEnumeration.path}) with URI ${IgnoredUris.SKOS_CONCEPT}`,
      );
    });

    it('should include SKOS Concept elements when ignoreSkosConcept is false', async () => {
      // IsgnoreSkosConcept disabled
      (<any>config)._ignoreSkosConcept = false;

      const regularElement = createMockElement(1, 'RegularClass');
      const skosEnumeration = createMockElement(
        2,
        'SkosConceptEnumeration',
        ElementType.Enumeration,
      );

      mockDataRegistry.elements = [regularElement, skosEnumeration];

      mockUriRegistry.elementIdUriMap.set(
        1,
        new URL('http://example.org/id/class/1'),
      );
      mockUriRegistry.elementIdUriMap.set(2, new URL(IgnoredUris.SKOS_CONCEPT));

      jest
        .spyOn(handler, 'createQuads')
        .mockImplementation((element) => [
          df.quad(
            df.namedNode(`urn:oslo-toolchain:guid-${element.id}`),
            ns.rdf('type'),
            ns.owl('Class'),
          ),
        ]);

      const result = await handler.convert(
        mockDataRegistry,
        mockUriRegistry,
        store,
      );

      const quads = result.findQuads(null, null, null);
      expect(quads).toHaveLength(2);

      const subjects = quads.map((q) => q.subject.value);
      expect(subjects).toContain('urn:oslo-toolchain:guid-1'); // SKOS element
      expect(subjects).toContain('urn:oslo-toolchain:guid-2'); // Regular element

      expect(logger.info).not.toHaveBeenCalled();
    });

    it('should include SKOS Concept class but not Enum', async () => {
      // IgnoreSkosConcept enabled
      (<any>config)._ignoreSkosConcept = true;
      const regularElement = createMockElement(1, 'RegularClass');
      const skosElement = createMockElement(2, 'SkosConceptClass');
      const skosEnumeration = createMockElement(
        3,
        'SkosConceptEnumeration',
        ElementType.Enumeration,
      );

      mockDataRegistry.elements = [
        regularElement,
        skosElement,
        skosEnumeration,
      ];

      mockUriRegistry.elementIdUriMap.set(
        1,
        new URL('http://example.org/id/class/1'),
      );
      mockUriRegistry.elementIdUriMap.set(2, new URL(IgnoredUris.SKOS_CONCEPT));
      mockUriRegistry.elementIdUriMap.set(3, new URL(IgnoredUris.SKOS_CONCEPT));

      jest
        .spyOn(handler, 'createQuads')
        .mockImplementation((element) => [
          df.quad(
            df.namedNode(`urn:oslo-toolchain:guid-${element.id}`),
            ns.rdf('type'),
            ns.owl('Class'),
          ),
        ]);

      const result = await handler.convert(
        mockDataRegistry,
        mockUriRegistry,
        store,
      );

      const quads = result.findQuads(null, null, null);
      expect(quads).toHaveLength(2);

      const subjects = quads.map((q) => q.subject.value);
      expect(subjects).toContain('urn:oslo-toolchain:guid-1'); // Regular element
      expect(subjects).toContain('urn:oslo-toolchain:guid-2'); // SKOS element

      expect(logger.info).toHaveBeenCalledWith(
        `[ElementConverterHandler]: Ignoring SKOS Concept element (${skosEnumeration.path}) with URI ${IgnoredUris.SKOS_CONCEPT}`,
      );
    });

    it('should log unknown tags when allTags is enabled', async () => {
      // Enable allTags
      (<any>config)._allTags = true;

      const elementWithUnknownTags = createMockElement(
        1,
        'ElementWithUnknownTags',
        ElementType.Class,
        'TestPackage::ElementWithUnknownTags',
        [
          { tagName: 'unknownTag1', tagValue: 'value1' },
          { tagName: 'unknownTag2', tagValue: 'value2' },
        ],
      );

      jest.spyOn(<any>handler, 'addDefinitions').mockReturnValue([]);
      jest.spyOn(<any>handler, 'addLabels').mockReturnValue([]);
      jest.spyOn(<any>handler, 'addUsageNotes').mockReturnValue([]);
      jest.spyOn(<any>handler, 'addStatus').mockReturnValue([]);
      jest.spyOn(<any>handler, 'addScope').mockReturnValue([]);
      jest.spyOn(<any>handler, 'getParentInformationQuads').mockReturnValue([]);

      mockDataRegistry.elements = [elementWithUnknownTags];
      mockUriRegistry.elementIdUriMap.set(
        1,
        new URL('http://example.org/id/class/1'),
      );

      await handler.convert(mockDataRegistry, mockUriRegistry, store);

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining(
          '[ElementConverterHandler]: Unknown tags for element (TestPackage::ElementWithUnknownTags)',
        ),
      );
    });

    it('should not log unknown tags when allTags is disabled', async () => {
      // Enable allTags
      (<any>config)._allTags = false;

      const elementWithUnknownTags = createMockElement(
        1,
        'ElementWithUnknownTags',
        ElementType.Class,
        'TestPackage::ElementWithUnknownTags',
        [
          { tagName: 'unknownTag1', tagValue: 'value1' },
          { tagName: 'unknownTag2', tagValue: 'value2' },
        ],
      );

      jest.spyOn(<any>handler, 'addDefinitions').mockReturnValue([]);
      jest.spyOn(<any>handler, 'addLabels').mockReturnValue([]);
      jest.spyOn(<any>handler, 'addUsageNotes').mockReturnValue([]);
      jest.spyOn(<any>handler, 'addStatus').mockReturnValue([]);
      jest.spyOn(<any>handler, 'addScope').mockReturnValue([]);
      jest.spyOn(<any>handler, 'getParentInformationQuads').mockReturnValue([]);

      mockDataRegistry.elements = [elementWithUnknownTags];
      mockUriRegistry.elementIdUriMap.set(
        1,
        new URL('http://example.org/id/class/1'),
      );

      await handler.convert(mockDataRegistry, mockUriRegistry, store);

      expect(logger.info).not.toHaveBeenCalledWith(
        expect.stringContaining(
          '[ElementConverterHandler]: Unknown tags for element (TestPackage::ElementWithUnknownTags)',
        ),
      );
    });
  });
});
