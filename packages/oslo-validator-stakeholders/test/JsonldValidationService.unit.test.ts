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
      expect(result.invalidUris).toHaveLength(0);
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
      expect(result.invalidUris).toHaveLength(0);
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
      expect(result.invalidUris).toHaveLength(1);
      expect(result.invalidUris[0].uri).toBe(
        'http://non-whitelisted.org/resource',
      );
    });
  });
});
