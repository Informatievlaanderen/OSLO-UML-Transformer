/**
 * @group unit
 */
import 'reflect-metadata';
import { QuadStore, VoidLogger } from '@oslo-flanders/core';
import { DataFactory } from 'rdf-data-factory';
import { JsonldValidationServiceConfiguration } from '../lib/config/JsonldValidationServiceConfiguration';
import { JsonldValidationService } from '../lib/JsonldValidationService';

// Mock fetchFileOrUrl to prevent actual HTTP requests
jest.mock('@oslo-flanders/core', () => {
  return {
    ...jest.requireActual('@oslo-flanders/core'),
    fetchFileOrUrl: jest.fn(),
  };
});

describe('JsonldValidationService', () => {
  let service: JsonldValidationService;
  let logger: VoidLogger;
  let config: JsonldValidationServiceConfiguration;
  let store: QuadStore;
  const df = new DataFactory();

  beforeEach(() => {
    logger = new VoidLogger();
    jest.spyOn(logger, 'info');
    jest.spyOn(logger, 'warn');
    jest.spyOn(logger, 'error');

    config = new JsonldValidationServiceConfiguration();
    (<any>config)._input = 'input.jsonld';
    (<any>config)._whitelist = 'whitelist.json';

    store = new QuadStore();

    service = new JsonldValidationService(logger, config, store);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('run', () => {
    it('should validate URIs and report success when all URIs are whitelisted', async () => {
      // Set up whitelist
      (<any>service).whitelist = ['http://example.org/', 'http://www.w3.org/'];

      // Mock findQuads to return valid URIs
      const validQuad = df.quad(
        df.namedNode('http://subject'),
        df.namedNode(
          'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI',
        ),
        df.namedNode('http://example.org/valid'),
      );
      jest.spyOn(store, 'findQuads').mockReturnValue([validQuad]);

      await service.run();

      expect(logger.info).toHaveBeenCalledWith(
        'Validation successful! All assigned URIs are whitelisted.',
      );
    });

    it('should validate URIs and report failures when non-whitelisted URIs are found', async () => {
      // Set up whitelist
      (<any>service).whitelist = ['http://example.org/', 'http://www.w3.org/'];

      // Mock findQuads to return both valid and invalid URIs
      const validQuad = df.quad(
        df.namedNode('http://subject1'),
        df.namedNode(
          'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI',
        ),
        df.namedNode('http://example.org/valid'),
      );
      const invalidQuad = df.quad(
        df.namedNode('http://subject2'),
        df.namedNode(
          'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI',
        ),
        df.namedNode('http://invalid-domain.org/invalid'),
      );
      jest.spyOn(store, 'findQuads').mockReturnValue([validQuad, invalidQuad]);

      await service.run();

      expect(logger.info).toHaveBeenCalledWith(
        'Validation found 1 non-whitelisted assigned URIs',
      );
      expect(logger.warn).toHaveBeenCalledWith(
        'Found non-whitelisted assigned URI: http://invalid-domain.org/invalid for subject: http://subject2',
      );
    });

    it('should only validate NamedNode objects of assignedURI predicates', async () => {
      // Set up whitelist
      (<any>service).whitelist = ['http://example.org/'];

      // Mock findQuads to return a mix of term types
      const namedNodeQuad = df.quad(
        df.namedNode('http://subject1'),
        df.namedNode(
          'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI',
        ),
        df.namedNode('http://invalid-domain.org/invalid'),
      );
      const literalQuad = df.quad(
        df.namedNode('http://subject2'),
        df.namedNode(
          'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI',
        ),
        df.literal('This is a literal'),
      );
      jest
        .spyOn(store, 'findQuads')
        .mockReturnValue([namedNodeQuad, literalQuad]);

      await service.run();

      // Only the NamedNode should be validated and reported as invalid
      expect(logger.info).toHaveBeenCalledWith(
        'Validation found 1 non-whitelisted assigned URIs',
      );
      expect(logger.warn).toHaveBeenCalledWith(
        'Found non-whitelisted assigned URI: http://invalid-domain.org/invalid for subject: http://subject1',
      );
    });
  });

  describe('validateUris', () => {
    it('should identify URIs that match the whitelist exactly', async () => {
      // Set up whitelist with exact URIs
      (<any>service).whitelist = [
        'http://example.org/exact',
        'http://www.w3.org/exact',
      ];

      // Mock findQuads to return an exact match
      const exactMatchQuad = df.quad(
        df.namedNode('http://subject'),
        df.namedNode(
          'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI',
        ),
        df.namedNode('http://example.org/exact'),
      );
      jest.spyOn(store, 'findQuads').mockReturnValue([exactMatchQuad]);

      const result = (<any>service).validateUris();

      expect(result.isValid).toBe(true);
      expect(result.invalidEntries).toHaveLength(0);
    });

    it('should identify URIs that match the whitelist prefixes', async () => {
      // Set up whitelist with prefixes
      (<any>service).whitelist = ['http://example.org/', 'http://www.w3.org/'];

      // Mock findQuads to return a prefix match
      const prefixMatchQuad = df.quad(
        df.namedNode('http://subject'),
        df.namedNode(
          'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI',
        ),
        df.namedNode('http://example.org/resource/123'),
      );
      jest.spyOn(store, 'findQuads').mockReturnValue([prefixMatchQuad]);

      const result = (<any>service).validateUris();

      expect(result.isValid).toBe(true);
      expect(result.invalidEntries).toHaveLength(0);
    });

    it('should identify URIs that do not match any whitelist entry', async () => {
      // Set up whitelist
      (<any>service).whitelist = ['http://example.org/', 'http://www.w3.org/'];

      // Mock findQuads to return non-matching URIs
      const nonMatchingQuad = df.quad(
        df.namedNode('http://subject'),
        df.namedNode(
          'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI',
        ),
        df.namedNode('http://non-whitelisted.org/resource'),
      );
      jest.spyOn(store, 'findQuads').mockReturnValue([nonMatchingQuad]);

      const result = (<any>service).validateUris();

      expect(result.isValid).toBe(false);
      expect(result.invalidEntries).toHaveLength(1);
      expect(result.invalidEntries[0].uri).toBe(
        'http://non-whitelisted.org/resource',
      );
    });
  });

  describe('validateSentences', () => {
    it('should detect empty strings', async () => {
      // Mock findQuads to return a Literal as a definition without a capital at the beginning
      const nonMatchingQuads = [
        df.quad(
          df.namedNode('http://subject/apDefinition'),
          df.namedNode(
            'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apDefinition',
          ),
          df.literal(''),
        ),
        df.quad(
          df.namedNode('http://subject/vocDefinition'),
          df.namedNode(
            'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocDefinition',
          ),
          df.literal(''),
        ),
        df.quad(
          df.namedNode('http://subject/apUsageNote'),
          df.namedNode(
            'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apUsageNote',
          ),
          df.literal(''),
        ),
        df.quad(
          df.namedNode('http://subject/vocUsageNote'),
          df.namedNode(
            'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocUsageNote',
          ),
          df.literal(''),
        ),
      ];
      jest.spyOn(store, 'findQuads').mockReturnValueOnce(nonMatchingQuads);

      const result = (<any>service).validateSentences();
      expect(result.isValid).toBe(false);

      expect(result.invalidEntries).toHaveLength(4);
      expect(result.invalidEntries[0].uri).toBe('http://subject/apDefinition');
      expect(result.invalidEntries[1].uri).toBe('http://subject/vocDefinition');
      expect(result.invalidEntries[2].uri).toBe('http://subject/apUsageNote');
      expect(result.invalidEntries[3].uri).toBe('http://subject/vocUsageNote');
    });

    it('should detect TODOs and FIXMEs', async () => {
      // Mock findQuads to return a Literal as a definition without a capital at the beginning
      const nonMatchingQuads = [
        df.quad(
          df.namedNode('http://subject/apDefinition'),
          df.namedNode(
            'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apDefinition',
          ),
          df.literal('TODO'),
        ),
        df.quad(
          df.namedNode('http://subject/vocDefinition'),
          df.namedNode(
            'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocDefinition',
          ),
          df.literal('FIXME'),
        ),
        df.quad(
          df.namedNode('http://subject/apUsageNote'),
          df.namedNode(
            'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apUsageNote',
          ),
          df.literal('todo'),
        ),
        df.quad(
          df.namedNode('http://subject/vocUsageNote'),
          df.namedNode(
            'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocUsageNote',
          ),
          df.literal('fixme'),
        ),
      ];
      jest.spyOn(store, 'findQuads').mockReturnValueOnce(nonMatchingQuads);

      const result = (<any>service).validateSentences();
      expect(result.isValid).toBe(false);

      expect(result.invalidEntries).toHaveLength(4);
      expect(result.invalidEntries[0].uri).toBe('http://subject/apDefinition');
      expect(result.invalidEntries[1].uri).toBe('http://subject/vocDefinition');
      expect(result.invalidEntries[2].uri).toBe('http://subject/apUsageNote');
      expect(result.invalidEntries[3].uri).toBe('http://subject/vocUsageNote');
    });

    it('should detect sentences without a capital letter at the beginning', async () => {
      // Mock findQuads to return a Literal as a definition without a capital at the beginning
      const nonMatchingQuads = [
        df.quad(
          df.namedNode('http://subject/apDefinition'),
          df.namedNode(
            'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apDefinition',
          ),
          df.literal('ap Definition without a dot.'),
        ),
        df.quad(
          df.namedNode('http://subject/vocDefinition'),
          df.namedNode(
            'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocDefinition',
          ),
          df.literal('voc Definition without a dot.'),
        ),
        df.quad(
          df.namedNode('http://subject/apUsageNote'),
          df.namedNode(
            'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apUsageNote',
          ),
          df.literal('ap Usage Note without a dot.'),
        ),
        df.quad(
          df.namedNode('http://subject/vocUsageNote'),
          df.namedNode(
            'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocUsageNote',
          ),
          df.literal('voc Usage Note without a dot.'),
        ),
      ];
      jest.spyOn(store, 'findQuads').mockReturnValueOnce(nonMatchingQuads);

      const result = (<any>service).validateSentences();
      expect(result.isValid).toBe(false);

      expect(result.invalidEntries).toHaveLength(4);
      expect(result.invalidEntries[0].uri).toBe('http://subject/apDefinition');
      expect(result.invalidEntries[1].uri).toBe('http://subject/vocDefinition');
      expect(result.invalidEntries[2].uri).toBe('http://subject/apUsageNote');
      expect(result.invalidEntries[3].uri).toBe('http://subject/vocUsageNote');
    });

    it('should detect sentences without a dot at the end', async () => {
      // Mock findQuads to return a Literal as a definition without a dot at the end
      const nonMatchingQuads = [
        df.quad(
          df.namedNode('http://subject/apDefinition'),
          df.namedNode(
            'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apDefinition',
          ),
          df.literal('AP Definition without a dot'),
        ),
        df.quad(
          df.namedNode('http://subject/vocDefinition'),
          df.namedNode(
            'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocDefinition',
          ),
          df.literal('VOC Definition without a dot'),
        ),
        df.quad(
          df.namedNode('http://subject/apUsageNote'),
          df.namedNode(
            'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apUsageNote',
          ),
          df.literal('AP Usage Note without a dot'),
        ),
        df.quad(
          df.namedNode('http://subject/vocUsageNote'),
          df.namedNode(
            'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocUsageNote',
          ),
          df.literal('VOC Usage Note without a dot'),
        ),
      ];
      jest.spyOn(store, 'findQuads').mockReturnValueOnce(nonMatchingQuads);

      const result = (<any>service).validateSentences();
      expect(result.isValid).toBe(false);

      expect(result.invalidEntries).toHaveLength(4);
      expect(result.invalidEntries[0].uri).toBe('http://subject/apDefinition');
      expect(result.invalidEntries[1].uri).toBe('http://subject/vocDefinition');
      expect(result.invalidEntries[2].uri).toBe('http://subject/apUsageNote');
      expect(result.invalidEntries[3].uri).toBe('http://subject/vocUsageNote');
    });
  });

  describe('validateLabels', () => {
    it('should detect empty strings', async () => {
      // Mock findQuads to return a Literal as an empty label
      const nonMatchingQuads = [
        df.quad(
          df.namedNode('http://subject/apLabel'),
          df.namedNode(
            'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel',
          ),
          df.literal(''),
        ),
        df.quad(
          df.namedNode('http://subject/vocLabel'),
          df.namedNode(
            'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocLabel',
          ),
          df.literal(''),
        ),
      ];
      jest.spyOn(store, 'findQuads').mockReturnValueOnce(nonMatchingQuads);

      const result = (<any>service).validateLabels();
      expect(result.isValid).toBe(false);

      expect(result.invalidEntries).toHaveLength(2);
      expect(result.invalidEntries[0].uri).toBe('http://subject/apLabel');
      expect(result.invalidEntries[1].uri).toBe('http://subject/vocLabel');
    });

    it('should detect TODOs and FIXMEs', async () => {
      // Mock findQuads to return a Literal as a label with a TODO or FIXME
      const nonMatchingQuads = [
        df.quad(
          df.namedNode('http://subject/apLabel'),
          df.namedNode(
            'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel',
          ),
          df.literal('TODO'),
        ),
        df.quad(
          df.namedNode('http://subject/vocLabel'),
          df.namedNode(
            'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocLabel',
          ),
          df.literal('FIXME'),
        ),
      ];
      jest.spyOn(store, 'findQuads').mockReturnValueOnce(nonMatchingQuads);

      const result = (<any>service).validateLabels();
      expect(result.isValid).toBe(false);

      expect(result.invalidEntries).toHaveLength(2);
      expect(result.invalidEntries[0].uri).toBe('http://subject/apLabel');
      expect(result.invalidEntries[1].uri).toBe('http://subject/vocLabel');
    });

    it('should detect labels with a dot at the end', async () => {
      // Mock findQuads to return a Literal as a definition without a dot at the end
      const nonMatchingQuads = [
        df.quad(
          df.namedNode('http://subject/apLabel'),
          df.namedNode(
            'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel',
          ),
          df.literal('ap-label.'),
        ),
        df.quad(
          df.namedNode('http://subject/vocLabel'),
          df.namedNode(
            'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocLabel',
          ),
          df.literal('voc-label.'),
        ),
      ];
      jest.spyOn(store, 'findQuads').mockReturnValueOnce(nonMatchingQuads);

      const result = (<any>service).validateLabels();
      expect(result.isValid).toBe(false);

      expect(result.invalidEntries).toHaveLength(2);
      expect(result.invalidEntries[0].uri).toBe('http://subject/apLabel');
      expect(result.invalidEntries[1].uri).toBe('http://subject/vocLabel');
    });

    it('should detect labels with non-alphanumeric characters', async () => {
      // Mock findQuads to return a Literal as a definition without a dot at the end
      const nonMatchingQuads = [
        df.quad(
          df.namedNode('http://subject/apLabel'),
          df.namedNode(
            'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel',
          ),
          df.literal('ap label&'),
        ),
        df.quad(
          df.namedNode('http://subject/vocLabel'),
          df.namedNode(
            'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocLabel',
          ),
          df.literal('voc-label@'),
        ),
        df.quad(
          df.namedNode('http://subject/accentLabel'),
          df.namedNode(
            'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocLabel',
          ),
          df.literal('geïmplementeerd'),
        ),
      ];
      jest.spyOn(store, 'findQuads').mockReturnValueOnce(nonMatchingQuads);

      const result = (<any>service).validateLabels();
      expect(result.isValid).toBe(false);

      expect(result.invalidEntries).toHaveLength(2);
      expect(result.invalidEntries[0].uri).toBe('http://subject/apLabel');
      expect(result.invalidEntries[1].uri).toBe('http://subject/vocLabel');
    });
  });

  describe('validateBaseURIs', () => {
    it('should detect missing hash or dash at the end', async () => {
      // Mock findQuads to return a Literal as an empty label
      const nonMatchingQuads = [
        df.quad(
          df.namedNode('http://subject/baseURIHash'),
          df.namedNode(
            'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#baseURI',
          ),
          df.namedNode('https://data.vlaanderen.be/ns/missingHash'),
        ),
        df.quad(
          df.namedNode('http://subject/baseURIDash'),
          df.namedNode(
            'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#baseURI',
          ),
          df.namedNode('https://data.vlaanderen.be/ns/missingDash'),
        ),
        df.quad(
          df.namedNode('http://subject/baseURIOKHash'),
          df.namedNode(
            'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#baseURI',
          ),
          df.namedNode('https://data.vlaanderen.be/ns/OK#'),
        ),
        df.quad(
          df.namedNode('http://subject/baseURIOKDash'),
          df.namedNode(
            'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#baseURI',
          ),
          df.namedNode('https://data.vlaanderen.be/ns/OK/'),
        ),
      ];
      jest.spyOn(store, 'findQuads').mockReturnValueOnce(nonMatchingQuads);

      const result = (<any>service).validateBaseURIs();
      expect(result.isValid).toBe(false);

      expect(result.invalidEntries).toHaveLength(2);
      expect(result.invalidEntries[0].uri).toBe('http://subject/baseURIHash');
      expect(result.invalidEntries[1].uri).toBe('http://subject/baseURIDash');
    });

    it('should detect TODOs and FIXMEs', async () => {
      // Mock findQuads to return a Literal as a label with a TODO or FIXME
      const nonMatchingQuads = [
        df.quad(
          df.namedNode('http://subject/baseURI/TODO'),
          df.namedNode(
            'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#baseURI',
          ),
          df.namedNode('TODO'),
        ),
        df.quad(
          df.namedNode('http://subject/baseURI/FIXME'),
          df.namedNode(
            'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#baseURI',
          ),
          df.namedNode('FIXME'),
        ),
      ];
      jest.spyOn(store, 'findQuads').mockReturnValueOnce(nonMatchingQuads);

      const result = (<any>service).validateBaseURIs();
      expect(result.isValid).toBe(false);

      expect(result.invalidEntries).toHaveLength(2);
      expect(result.invalidEntries[0].uri).toBe('http://subject/baseURI/TODO');
      expect(result.invalidEntries[1].uri).toBe('http://subject/baseURI/FIXME');
    });
  });

  describe('catchMissingClasses', () => {
    it('should catch missing classes', async () => {
      // Mock findQuads to return a class with only a diagram label
      const diagramQuad = df.quad(
        df.namedNode('http://subject/MissingClass'),
        df.namedNode(
          'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#diagramLabel',
        ),
        df.literal('Class with only diagram label'),
      );
      const assignedURIQuad = df.quad(
        df.namedNode('http://subject/MissingClass'),
        df.namedNode(
          'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI',
        ),
        df.namedNode('http://example.org/MyClass'),
      );
      jest
        .spyOn(store, 'findQuads')
        .mockReturnValueOnce([diagramQuad])
        .mockReturnValueOnce([assignedURIQuad]);

      const result = (<any>service).validateMissingClasses();
      expect(result.isValid).toBe(false);
      expect(result.invalidEntries[0].uri).toBe('http://subject/MissingClass');
      expect(result.invalidEntries).toHaveLength(1);
    });

    it('should not fail for XSD datatypes as they are never included', async () => {
      // Mock findQuads to return a Literal for XSD Datatypes
      const diagramQuad = df.quad(
        df.namedNode('http://subject/MissingClassDatatype'),
        df.namedNode(
          'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#diagramLabel',
        ),
        df.literal('XSD Datatype Float'),
      );
      const assignedURIQuad = df.quad(
        df.namedNode('http://subject/MissingClassDatatype'),
        df.namedNode(
          'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI',
        ),
        df.namedNode('http://www.w3.org/2001/XMLSchema#float'),
      );
      jest
        .spyOn(store, 'findQuads')
        .mockReturnValueOnce([diagramQuad])
        .mockReturnValueOnce([assignedURIQuad]);

      const result = (<any>service).validateMissingClasses();
      expect(result.isValid).toBe(true);
      expect(result.invalidEntries).toHaveLength(0);
    });
  });
});
