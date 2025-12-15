/**
 * @group unit
 */
import 'reflect-metadata';
import { QuadStore } from '@oslo-flanders/core';
import { VoidLogger } from '@oslo-flanders/core/lib/logging/VoidLogger';
import type { DataRegistry, EaElement } from '@oslo-flanders/ea-uml-extractor';
import { ElementType } from '@oslo-flanders/ea-uml-extractor';
import { DataFactory } from 'rdf-data-factory';
import { EaUmlConverterConfiguration } from '../lib/config/EaUmlConverterConfiguration';
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

  describe('convert method with allTags configuration', () => {
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
