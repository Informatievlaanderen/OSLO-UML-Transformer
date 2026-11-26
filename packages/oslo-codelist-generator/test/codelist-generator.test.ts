/**
 * @group integration
 */
import 'reflect-metadata';
import fs from 'fs/promises';
import path from 'path';
import { ns, QuadStore, VoidLogger } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import { rdfParser } from 'rdf-parse';
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

  function outputFile(name: string): string {
    return path.join(testDir, `${name}.ttl`);
  }

  beforeAll(async () => {
    // Create test directories
    await fs.mkdir(testDir, { recursive: true });
    await fs.mkdir(dataDir, { recursive: true });
  });

  afterAll(async () => {
    try {
      // remove this to test the output
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

      const outFile = outputFile('status-codelist');
      config = new CodelistGenerationServiceConfiguration();
      await config.createFromCli({
        input: inputFile,
        output: outFile,
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
        .stat(outFile)
        .then(() => true)
        .catch(() => false);
      expect(outputExists).toBe(true);

      // Parse and verify output
      const ttlContent = await fs.readFile(outFile, 'utf-8');
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
      const outFile = outputFile('multiple-schemes');

      config = new CodelistGenerationServiceConfiguration();
      await config.createFromCli({
        input: inputFile,
        output: outFile,
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

      const ttlContent = await fs.readFile(outFile, 'utf-8');
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
      const outFile = outputFile('simple-concept');

      config = new CodelistGenerationServiceConfiguration();
      await config.createFromCli({
        input: inputFile,
        output: outFile,
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

      const ttlContent = await fs.readFile(outFile, 'utf-8');

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
      const outFile = outputFile('broader-relationships');

      config = new CodelistGenerationServiceConfiguration();
      await config.createFromCli({
        input: inputFile,
        output: outFile,
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

      const ttlContent = await fs.readFile(outFile, 'utf-8');
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
    it('should use dcterms:isPartOf for ConceptScheme-to-ConceptScheme relationships instead of skos:inScheme/skos:topConceptOf', async () => {
      const inputFile = path.join(dataDir, 'nested-schemes.csv');
      const outFile = outputFile('nested-schemes');

      config = new CodelistGenerationServiceConfiguration();
      await config.createFromCli({
        input: inputFile,
        output: outFile,
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

      const ttlContent = await fs.readFile(outFile, 'utf-8');
      const quads = await parseRdf(ttlContent);

      // Concepts should still use skos:inScheme and skos:topConceptOf
      const conceptInScheme = quads.filter(
        (quad) =>
          quad.subject.value ===
          'https://data.vlaanderen.be/id/concept/IT000/Geslacht/v1/0' &&
          quad.predicate.value === ns.skos('inScheme').value,
      );
      expect(conceptInScheme).toHaveLength(1);
      expect(conceptInScheme[0].object.value).toBe(
        'https://data.vlaanderen.be/id/conceptscheme/IT000/Geslacht/v1',
      );

      const conceptTopConceptOf = quads.filter(
        (quad) =>
          quad.subject.value ===
          'https://data.vlaanderen.be/id/concept/IT000/Geslacht/v1/0' &&
          quad.predicate.value === ns.skos('topConceptOf').value,
      );
      expect(conceptTopConceptOf).toHaveLength(1);

      // ConceptSchemes should use dcterms:isPartOf instead of skos:inScheme
      // IT000/Geslacht/v1 -> IT000/Geslacht
      const schemeIsPartOf = quads.filter(
        (quad) =>
          quad.subject.value ===
          'https://data.vlaanderen.be/id/conceptscheme/IT000/Geslacht/v1' &&
          quad.predicate.value === ns.dcterms('isPartOf').value,
      );
      expect(schemeIsPartOf).toHaveLength(1);
      expect(schemeIsPartOf[0].object.value).toBe(
        'https://data.vlaanderen.be/id/conceptscheme/IT000/Geslacht',
      );

      // ConceptSchemes should NOT use skos:inScheme
      const schemeInScheme = quads.filter(
        (quad) =>
          quad.subject.value ===
          'https://data.vlaanderen.be/id/conceptscheme/IT000/Geslacht/v1' &&
          quad.predicate.value === ns.skos('inScheme').value,
      );
      expect(schemeInScheme).toHaveLength(0);

      // ConceptSchemes should NOT use skos:topConceptOf
      const schemeTopConceptOf = quads.filter(
        (quad) =>
          quad.subject.value ===
          'https://data.vlaanderen.be/id/conceptscheme/IT000/Geslacht/v1' &&
          quad.predicate.value === ns.skos('topConceptOf').value,
      );
      expect(schemeTopConceptOf).toHaveLength(0);

      // IT000/Geslacht -> IT000
      const schemeIsPartOf2 = quads.filter(
        (quad) =>
          quad.subject.value ===
          'https://data.vlaanderen.be/id/conceptscheme/IT000/Geslacht' &&
          quad.predicate.value === ns.dcterms('isPartOf').value,
      );
      expect(schemeIsPartOf2).toHaveLength(1);
      expect(schemeIsPartOf2[0].object.value).toBe(
        'https://data.vlaanderen.be/id/conceptscheme/IT000',
      );

      // IT000 -> MAGDA/Persoon
      const schemeIsPartOf3 = quads.filter(
        (quad) =>
          quad.subject.value ===
          'https://data.vlaanderen.be/id/conceptscheme/IT000' &&
          quad.predicate.value === ns.dcterms('isPartOf').value,
      );
      expect(schemeIsPartOf3).toHaveLength(1);
      expect(schemeIsPartOf3[0].object.value).toBe(
        'https://data.vlaanderen.be/id/conceptscheme/MAGDA/Persoon',
      );

      // Top-level scheme (MAGDA/Persoon) should have no isPartOf
      const schemeIsPartOf4 = quads.filter(
        (quad) =>
          quad.subject.value ===
          'https://data.vlaanderen.be/id/conceptscheme/MAGDA/Persoon' &&
          quad.predicate.value === ns.dcterms('isPartOf').value,
      );
      expect(schemeIsPartOf4).toHaveLength(0);

      // Parent ConceptSchemes should have dcterms:hasPart pointing to children
      // MAGDA/Persoon hasPart IT000
      const hasPart1 = quads.filter(
        (quad) =>
          quad.subject.value ===
          'https://data.vlaanderen.be/id/conceptscheme/MAGDA/Persoon' &&
          quad.predicate.value === ns.dcterms('hasPart').value &&
          quad.object.value ===
          'https://data.vlaanderen.be/id/conceptscheme/IT000',
      );
      expect(hasPart1).toHaveLength(1);

      // IT000 hasPart IT000/Geslacht
      const hasPart2 = quads.filter(
        (quad) =>
          quad.subject.value ===
          'https://data.vlaanderen.be/id/conceptscheme/IT000' &&
          quad.predicate.value === ns.dcterms('hasPart').value &&
          quad.object.value ===
          'https://data.vlaanderen.be/id/conceptscheme/IT000/Geslacht',
      );
      expect(hasPart2).toHaveLength(1);

      // IT000/Geslacht hasPart IT000/Geslacht/v1
      const hasPart3 = quads.filter(
        (quad) =>
          quad.subject.value ===
          'https://data.vlaanderen.be/id/conceptscheme/IT000/Geslacht' &&
          quad.predicate.value === ns.dcterms('hasPart').value &&
          quad.object.value ===
          'https://data.vlaanderen.be/id/conceptscheme/IT000/Geslacht/v1',
      );
      expect(hasPart3).toHaveLength(1);

      // Leaf scheme (IT000/Geslacht/v1) should have no hasPart
      const hasPart4 = quads.filter(
        (quad) =>
          quad.subject.value ===
          'https://data.vlaanderen.be/id/conceptscheme/IT000/Geslacht/v1' &&
          quad.predicate.value === ns.dcterms('hasPart').value,
      );
      expect(hasPart4).toHaveLength(0);
    });

    it('should generate dcterms:hasPart on parent ConceptSchemes for each child ConceptScheme', async () => {
      const inputFile = path.join(dataDir, 'haspart-schemes.csv');
      const outFile = outputFile('haspart-schemes');

      config = new CodelistGenerationServiceConfiguration();
      await config.createFromCli({
        input: inputFile,
        output: outFile,
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

      const ttlContent = await fs.readFile(outFile, 'utf-8');
      const quads = await parseRdf(ttlContent);

      // IT001 hasPart IT001/Dossierstatus
      const parentHasPart = quads.filter(
        (quad) =>
          quad.subject.value ===
          'https://data.vlaanderen.be/id/conceptscheme/IT001' &&
          quad.predicate.value === ns.dcterms('hasPart').value &&
          quad.object.value ===
          'https://data.vlaanderen.be/id/conceptscheme/IT001/Dossierstatus',
      );
      expect(parentHasPart).toHaveLength(1);

      // IT001/Dossierstatus hasPart IT001/Dossierstatus/v1
      const childHasPart = quads.filter(
        (quad) =>
          quad.subject.value ===
          'https://data.vlaanderen.be/id/conceptscheme/IT001/Dossierstatus' &&
          quad.predicate.value === ns.dcterms('hasPart').value &&
          quad.object.value ===
          'https://data.vlaanderen.be/id/conceptscheme/IT001/Dossierstatus/v1',
      );
      expect(childHasPart).toHaveLength(1);

      // IT001/Dossierstatus/v1 (leaf) should have no hasPart
      const leafHasPart = quads.filter(
        (quad) =>
          quad.subject.value ===
          'https://data.vlaanderen.be/id/conceptscheme/IT001/Dossierstatus/v1' &&
          quad.predicate.value === ns.dcterms('hasPart').value,
      );
      expect(leafHasPart).toHaveLength(0);

      // IT001 (top-level, no inScheme) should have no isPartOf
      const topIsPartOf = quads.filter(
        (quad) =>
          quad.subject.value ===
          'https://data.vlaanderen.be/id/conceptscheme/IT001' &&
          quad.predicate.value === ns.dcterms('isPartOf').value,
      );
      expect(topIsPartOf).toHaveLength(0);
    });

    it('should keep skos:hasTopConcept for Concept-to-ConceptScheme relationships alongside dcterms:hasPart for ConceptScheme-to-ConceptScheme', async () => {
      const inputFile = path.join(dataDir, 'haspart-schemes.csv');
      const outFile = outputFile('haspart-schemes');

      config = new CodelistGenerationServiceConfiguration();
      await config.createFromCli({
        input: inputFile,
        output: outFile,
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

      const ttlContent = await fs.readFile(outFile, 'utf-8');
      const quads = await parseRdf(ttlContent);

      // IT001/Dossierstatus has skos:hasTopConcept pointing to its version scheme
      // (from the hasTopConcept column in the CSV)
      const hasTopConcept = quads.filter(
        (quad) =>
          quad.subject.value ===
          'https://data.vlaanderen.be/id/conceptscheme/IT001/Dossierstatus' &&
          quad.predicate.value === ns.skos('hasTopConcept').value &&
          quad.object.value ===
          'https://data.vlaanderen.be/id/conceptscheme/IT001/Dossierstatus/v1',
      );
      expect(hasTopConcept).toHaveLength(1);

      // IT001/Dossierstatus also has dcterms:hasPart pointing to the same child
      const hasPart = quads.filter(
        (quad) =>
          quad.subject.value ===
          'https://data.vlaanderen.be/id/conceptscheme/IT001/Dossierstatus' &&
          quad.predicate.value === ns.dcterms('hasPart').value &&
          quad.object.value ===
          'https://data.vlaanderen.be/id/conceptscheme/IT001/Dossierstatus/v1',
      );
      expect(hasPart).toHaveLength(1);

      // The child scheme should have dcterms:isPartOf (not skos:inScheme)
      const childIsPartOf = quads.filter(
        (quad) =>
          quad.subject.value ===
          'https://data.vlaanderen.be/id/conceptscheme/IT001/Dossierstatus/v1' &&
          quad.predicate.value === ns.dcterms('isPartOf').value,
      );
      expect(childIsPartOf).toHaveLength(1);

      // The child scheme should NOT have skos:inScheme
      const childInScheme = quads.filter(
        (quad) =>
          quad.subject.value ===
          'https://data.vlaanderen.be/id/conceptscheme/IT001/Dossierstatus/v1' &&
          quad.predicate.value === ns.skos('inScheme').value,
      );
      expect(childInScheme).toHaveLength(0);
    });

    it('should not generate dcterms:isPartOf or dcterms:hasPart for flat (non-nested) concept schemes', async () => {
      const inputFile = path.join(dataDir, 'status-codelist.csv');
      const outFile = outputFile('status-codelist');

      config = new CodelistGenerationServiceConfiguration();
      await config.createFromCli({
        input: inputFile,
        output: outFile,
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

      const ttlContent = await fs.readFile(outFile, 'utf-8');
      const quads = await parseRdf(ttlContent);

      // No dcterms:isPartOf should appear
      const isPartOfQuads = quads.filter(
        (quad) => quad.predicate.value === ns.dcterms('isPartOf').value,
      );
      expect(isPartOfQuads).toHaveLength(0);

      // No dcterms:hasPart should appear
      const hasPartQuads = quads.filter(
        (quad) => quad.predicate.value === ns.dcterms('hasPart').value,
      );
      expect(hasPartQuads).toHaveLength(0);

      // Concepts still use skos:inScheme
      const inSchemeQuads = quads.filter(
        (quad) => quad.predicate.value === ns.skos('inScheme').value,
      );
      expect(inSchemeQuads.length).toBeGreaterThan(0);
    });

    it('should break when there are rows with missing required @id', async () => {
      const inputFile = path.join(dataDir, 'missing-id.csv');
      const outFile = outputFile('missing-id');

      config = new CodelistGenerationServiceConfiguration();
      await config.createFromCli({
        input: inputFile,
        output: outFile,
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
      const outFile = outputFile('empty-definitions');

      config = new CodelistGenerationServiceConfiguration();
      await config.createFromCli({
        input: inputFile,
        output: outFile,
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

      const ttlContent = await fs.readFile(outFile, 'utf-8');
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
        output: outputFile('nonexistent'),
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
