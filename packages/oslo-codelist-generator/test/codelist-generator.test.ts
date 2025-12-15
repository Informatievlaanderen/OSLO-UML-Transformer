/**
 * @group integration
 */
import 'reflect-metadata';
import fs from 'fs/promises';
import path from 'path';
import { ns, QuadStore, VoidLogger } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import rdfParser from 'rdf-parse';
import streamifyString from 'streamify-string';
import { CodelistGenerationService } from '../lib/CodelistGenerationService';
import { CodelistGenerationServiceConfiguration } from '../lib/config/CodelistGenerationServiceConfiguration';

function parseRdf(data: string): Promise<RDF.Quad[]> {
  return new Promise((resolve, reject) => {
    const quads: RDF.Quad[] = [];
    rdfParser
      .parse(streamifyString(data), { contentType: 'text/turtle' })
      .on('data', (quad: RDF.Quad) => quads.push(quad))
      .on('end', () => resolve(quads))
      .on('error', reject);
  });
}

describe('CodelistGenerationService Integration Tests', () => {
  let service: CodelistGenerationService;
  let config: any;
  let store: QuadStore;
  const logger = new VoidLogger();
  const df = new DataFactory();
  const testDir = path.join(__dirname, 'test-output');
  const dataDir = path.join(__dirname, 'data');
  const outputFile = path.join(testDir, 'output.ttl');

  beforeAll(async () => {
    // Create test directories
    await fs.mkdir(testDir, { recursive: true });
    await fs.mkdir(dataDir, { recursive: true });
  });

  afterAll(async () => {
    // Clean up test files
    try {
      await fs.rm(testDir, { recursive: true });
    } catch {
      // Directory might not exist
    }
  });

  beforeEach(() => {
    store = new QuadStore();
  });

  describe('CSV to SKOS Conversion', () => {
    it('should convert a simple status codelist from CSV to SKOS Turtle', async () => {
      const inputFile = path.join(dataDir, 'status-codelist.csv');

      config = new CodelistGenerationServiceConfiguration();
      await config.createFromCli({
        input: inputFile,
        output: outputFile,
        language: 'nl',
        labelColumn: 'prefLabel',
        definitionColumn: 'definition',
        notationColumn: 'notation',
        broaderColumn: 'broader',
        narrowerColumn: 'narrower',
        datasetColumn: 'dataset',
        statusColumn: 'status',
      });

      service = new CodelistGenerationService(config, logger, store);
      await service.run();

      // Verify output file exists
      const outputExists = await fs
        .stat(outputFile)
        .then(() => true)
        .catch(() => false);
      expect(outputExists).toBe(true);

      // Parse and verify output
      const ttlContent = await fs.readFile(outputFile, 'utf-8');
      const quads = await parseRdf(ttlContent);

      // Verify ConceptScheme
      expect(
        quads.some(
          (quad) =>
            quad.subject.value ===
              'https://data.vlaanderen.be/id/conceptscheme/StandaardStatus' &&
            quad.predicate.value === ns.rdf('type').value &&
            quad.object.value === ns.skos('ConceptScheme').value,
        ),
      ).toBe(true);

      // Verify Concepts
      expect(
        quads.some(
          (quad) =>
            quad.subject.value ===
              'https://data.vlaanderen.be/id/concept/StandaardStatus/ErkendeStandaard' &&
            quad.predicate.value === ns.rdf('type').value &&
            quad.object.value === ns.skos('Concept').value,
        ),
      ).toBe(true);

      // Verify prefLabel
      expect(
        quads.some(
          (quad) =>
            quad.subject.value ===
              'https://data.vlaanderen.be/id/concept/StandaardStatus/ErkendeStandaard' &&
            quad.predicate.value === ns.skos('prefLabel').value &&
            quad.object.value === 'Actief',
        ),
      ).toBe(true);

      // Verify notation
      expect(
        quads.some(
          (quad) =>
            quad.subject.value ===
              'https://data.vlaanderen.be/id/concept/StandaardStatus/ErkendeStandaard' &&
            quad.predicate.value === ns.skos('notation').value &&
            quad.object.value === 'ACTIVE',
        ),
      ).toBe(true);

      // Verify inScheme
      expect(
        quads.some(
          (quad) =>
            quad.subject.value ===
              'https://data.vlaanderen.be/id/concept/StandaardStatus/ErkendeStandaard' &&
            quad.predicate.value === ns.skos('inScheme').value &&
            quad.object.value ===
              'https://data.vlaanderen.be/id/conceptscheme/StandaardStatus',
        ),
      ).toBe(true);
    });

    it('should handle multiple concept schemes in a single CSV', async () => {
      const inputFile = path.join(dataDir, 'multiple-schemes.csv');

      config = new CodelistGenerationServiceConfiguration();
      await config.createFromCli({
        input: inputFile,
        output: outputFile,
        language: 'nl',
        labelColumn: 'prefLabel',
        definitionColumn: 'definition',
        notationColumn: 'notation',
        broaderColumn: 'broader',
        narrowerColumn: 'narrower',
        datasetColumn: 'dataset',
        statusColumn: 'status',
      });

      service = new CodelistGenerationService(config, logger, store);
      await service.run();

      const ttlContent = await fs.readFile(outputFile, 'utf-8');
      const quads = await parseRdf(ttlContent);

      // Verify both concept schemes exist
      expect(
        quads.filter(
          (quad) =>
            quad.predicate.value === ns.rdf('type').value &&
            quad.object.value === ns.skos('ConceptScheme').value,
        ),
      ).toHaveLength(2);

      // Verify both concepts exist
      expect(
        quads.filter(
          (quad) =>
            quad.predicate.value === ns.rdf('type').value &&
            quad.object.value === ns.skos('Concept').value,
        ),
      ).toHaveLength(2);
    });

    it('should format output with proper Turtle syntax', async () => {
      const inputFile = path.join(dataDir, 'simple-concept.csv');

      config = new CodelistGenerationServiceConfiguration();
      await config.createFromCli({
        input: inputFile,
        output: outputFile,
        language: 'en',
        labelColumn: 'prefLabel',
        definitionColumn: 'definition',
        notationColumn: 'notation',
        broaderColumn: 'broader',
        narrowerColumn: 'narrower',
        datasetColumn: 'dataset',
        statusColumn: 'status',
      });

      service = new CodelistGenerationService(config, logger, store);
      await service.run();

      const ttlContent = await fs.readFile(outputFile, 'utf-8');

      // Verify Turtle format
      expect(ttlContent).toMatch(/@prefix skos:/u);
      expect(ttlContent).not.toMatch(/\.\./u); // No double periods
      expect(ttlContent).toMatch(/\.$/mu); // Ends with period

      // Verify structure
      const lines = ttlContent.split('\n').filter((line) => line.trim());
      expect(lines.length).toBeGreaterThan(0);

      // Verify it's valid RDF by parsing
      const quads = await parseRdf(ttlContent);
      expect(quads.length).toBeGreaterThan(0);
    });

    it('should handle concepts with broader relationships', async () => {
      const inputFile = path.join(dataDir, 'broader-relationships.csv');

      config = new CodelistGenerationServiceConfiguration();
      await config.createFromCli({
        input: inputFile,
        output: outputFile,
        language: 'en',
        labelColumn: 'prefLabel',
        definitionColumn: 'definition',
        notationColumn: 'notation',
        broaderColumn: 'broader',
        narrowerColumn: 'narrower',
        datasetColumn: 'dataset',
        statusColumn: 'status',
      });

      service = new CodelistGenerationService(config, logger, store);
      await service.run();

      const ttlContent = await fs.readFile(outputFile, 'utf-8');
      const quads = await parseRdf(ttlContent);

      // Verify broader relationship
      expect(
        quads.some(
          (quad) =>
            quad.subject.value ===
              'https://data.vlaanderen.be/id/concept/Vehicles/Car' &&
            quad.predicate.value === ns.skos('broader').value &&
            quad.object.value ===
              'https://data.vlaanderen.be/id/concept/Vehicles/Vehicle',
        ),
      ).toBe(true);
    });
    it('should break when there are rows with missing required @id', async () => {
      const inputFile = path.join(dataDir, 'missing-id.csv');

      config = new CodelistGenerationServiceConfiguration();
      await config.createFromCli({
        input: inputFile,
        output: outputFile,
        language: 'en',
        labelColumn: 'prefLabel',
        definitionColumn: 'definition',
        notationColumn: 'notation',
        broaderColumn: 'broader',
        narrowerColumn: 'narrower',
        datasetColumn: 'dataset',
        statusColumn: 'status',
      });

      service = new CodelistGenerationService(config, logger, store);

      // The service should throw an error when encountering a missing @id
      await expect(service.run()).rejects.toThrow(
        // eslint-disable-next-line max-len
        'Missing or empty @id in row. Row data: {"@id":"","@type":"http://www.w3.org/2004/02/skos/core#Concept","prefLabel":"Incomplete Concept","definition":"Missing ID"}',
      );
    });

    it('should handle empty definition columns gracefully', async () => {
      const inputFile = path.join(dataDir, 'empty-definitions.csv');

      config = new CodelistGenerationServiceConfiguration();
      await config.createFromCli({
        input: inputFile,
        output: outputFile,
        language: 'en',
        labelColumn: 'prefLabel',
        definitionColumn: 'definition',
        notationColumn: 'notation',
        broaderColumn: 'broader',
        narrowerColumn: 'narrower',
        datasetColumn: 'dataset',
        statusColumn: 'status',
      });

      service = new CodelistGenerationService(config, logger, store);
      await service.run();

      const ttlContent = await fs.readFile(outputFile, 'utf-8');
      const quads = await parseRdf(ttlContent);

      // First concept should have no definition
      expect(
        quads.filter(
          (quad) =>
            quad.subject.value ===
              'https://data.vlaanderen.be/id/concept/Test/1' &&
            quad.predicate.value === ns.skos('definition').value,
        ),
      ).toHaveLength(0);

      // Second concept should have definition
      expect(
        quads.some(
          (quad) =>
            quad.subject.value ===
              'https://data.vlaanderen.be/id/concept/Test/2' &&
            quad.predicate.value === ns.skos('definition').value,
        ),
      ).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should throw an error when input file does not exist', async () => {
      config = new CodelistGenerationServiceConfiguration();
      await config.createFromCli({
        input: path.join(testDir, 'nonexistent.csv'),
        output: outputFile,
        language: 'en',
        labelColumn: 'prefLabel',
        definitionColumn: 'definition',
        notationColumn: 'notation',
        broaderColumn: 'broader',
        narrowerColumn: 'narrower',
        datasetColumn: 'dataset',
        statusColumn: 'status',
      });

      service = new CodelistGenerationService(config, logger, store);

      await expect(service.run()).rejects.toThrow();
    });
  });
});
