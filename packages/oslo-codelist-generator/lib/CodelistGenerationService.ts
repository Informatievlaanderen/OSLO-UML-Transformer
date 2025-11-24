import { inject, injectable } from 'inversify';
import {
  IService,
  Logger,
  ServiceIdentifier,
  QuadStore,
  ns,
  fetchFileOrUrl,
} from '@oslo-flanders/core';
import { CodelistGenerationServiceConfiguration } from './config/CodelistGenerationServiceConfiguration';
import { parse } from 'csv-parse';
import { Readable } from 'stream';
import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import { writeFile } from 'fs/promises';
import { Writer } from 'n3';
import { getPrefixes } from './constants/prefixes';
import {
  formatOutput,
  extractNamespaces,
  addPrefLabel,
  addDefinition,
  addNotation,
  addInScheme,
  addTopConceptOf,
  addNarrowerConcepts,
  addBroaderConcepts,
  addStatus,
  addDataset,
} from './utils/codelist.utils';

@injectable()
export class CodelistGenerationService implements IService {
  public readonly logger: Logger;
  public readonly configuration: CodelistGenerationServiceConfiguration;
  private readonly store: QuadStore;
  private readonly df: DataFactory;

  public constructor(
    @inject(ServiceIdentifier.Configuration)
    config: CodelistGenerationServiceConfiguration,
    @inject(ServiceIdentifier.Logger)
    logger: Logger,
    @inject(ServiceIdentifier.QuadStore)
    store: QuadStore,
  ) {
    this.logger = logger;
    this.configuration = config;
    this.store = store;
    this.df = new DataFactory();
  }

  public async init(): Promise<void> {
    // Nothing to init
  }

  public async run(): Promise<void> {
    this.logger.info('Starting codelist generation (SKOS from CSV)...');
    try {
      const csvData = await fetchFileOrUrl(this.configuration.input);
      const quads = await this.generateSkosFromCsv(csvData);

      this.store.addQuads(quads);
      await this.writeOutput();

      this.logger.info('Codelist generation completed successfully');
    } catch (error) {
      this.logger.error(`Failed to generate codelist: ${error}`);
      throw error;
    }
  }

  private createQuadsFromRow(row: any): RDF.Quad[] {
    const quads: RDF.Quad[] = [];

    // Validate that @id is present and not empty
    if (!row['@id'] || row['@id'].trim() === '') {
      throw new Error(
        `Missing or empty @id in row. Row data: ${JSON.stringify(row)}`,
      );
    }

    // Get the concept URI from the @id column
    const conceptUri = this.df.namedNode(row['@id']);

    // Validate that @type is present and not empty
    if (!row['@type'] || row['@type'].trim() === '') {
      throw new Error(
        `Missing or empty @type in row. Row data: ${JSON.stringify(row)}`,
      );
    }

    // Type - only add if it's a Concept
    if (row['@type'] === ns.skos('Concept').value) {
      quads.push(this.df.quad(conceptUri, ns.rdf('type'), ns.skos('Concept')));
    }

    addPrefLabel(
      quads,
      this.df,
      conceptUri,
      row[this.configuration.labelColumn],
      this.configuration.language,
    );
    addDefinition(
      quads,
      this.df,
      conceptUri,
      row[this.configuration.definitionColumn],
      this.configuration.language,
    );
    addNotation(
      quads,
      this.df,
      conceptUri,
      row[this.configuration.notationColumn],
    );
    addInScheme(quads, this.df, conceptUri, row.inScheme);
    addTopConceptOf(quads, this.df, conceptUri, row.topConceptOf);
    addNarrowerConcepts(
      quads,
      this.df,
      conceptUri,
      row[this.configuration.narrowerColumn],
    );
    addBroaderConcepts(
      quads,
      this.df,
      conceptUri,
      row[this.configuration.broaderColumn],
    );
    addStatus(quads, this.df, conceptUri, row[this.configuration.statusColumn]);
    addDataset(
      quads,
      this.df,
      conceptUri,
      row[this.configuration.datasetColumn],
    );
    return quads;
  }

  private async generateSkosFromCsv(csvData: Buffer): Promise<RDF.Quad[]> {
    const quads: RDF.Quad[] = [];
    const rows: any[] = [];

    return new Promise((resolve, reject) => {
      const parser = parse({
        columns: true,
        delimiter: ',',
        skip_empty_lines: true,
      });

      parser.on('readable', () => {
        let row;
        while ((row = parser.read())) {
          rows.push(row);
        }
      });

      parser.on('error', (error) => reject(error));

      parser.on('end', () => {
        try {
          // Find all ConceptScheme rows and group concepts by scheme
          const conceptSchemeMap = new Map<
            string,
            { schemeRow: any; conceptRows: any[] }
          >();
          const conceptSchemeIndices = new Set<number>();

          // First pass: identify scheme rows and group concepts
          for (const [index, row] of rows.entries()) {
            if (row['@type'] === ns.skos('ConceptScheme').value) {
              conceptSchemeIndices.add(index);
              conceptSchemeMap.set(row['@id'], {
                schemeRow: row,
                conceptRows: [],
              });
            }
          }

          // Second pass: group concepts by their inScheme
          for (const [index, row] of rows.entries()) {
            if (!conceptSchemeIndices.has(index) && row.inScheme) {
              const schemeEntry = conceptSchemeMap.get(row.inScheme);
              if (schemeEntry) {
                schemeEntry.conceptRows.push(row);
              }
            }
          }

          // Process all ConceptScheme rows with their grouped concepts
          for (const [
            schemeId,
            { schemeRow, conceptRows },
          ] of conceptSchemeMap) {
            // Validate ConceptScheme has @id
            if (!schemeRow['@id'] || schemeRow['@id'].trim() === '') {
              throw new Error(
                `ConceptScheme row has missing or empty @id. Row data: ${JSON.stringify(schemeRow)}`,
              );
            }

            const conceptScheme = this.df.namedNode(schemeRow['@id']);

            // Create ConceptScheme quads
            quads.push(
              this.df.quad(
                conceptScheme,
                ns.rdf('type'),
                ns.skos('ConceptScheme'),
              ),
            );

            // Add prefLabel for ConceptScheme
            if (schemeRow.prefLabel) {
              quads.push(
                this.df.quad(
                  conceptScheme,
                  ns.skos('prefLabel'),
                  this.df.literal(
                    schemeRow.prefLabel,
                    this.configuration.language,
                  ),
                ),
              );
            }

            // Add definition for ConceptScheme
            if (schemeRow.definition) {
              quads.push(
                this.df.quad(
                  conceptScheme,
                  ns.skos('definition'),
                  this.df.literal(
                    schemeRow.definition,
                    this.configuration.language,
                  ),
                ),
              );
            }

            // Add hasTopConcept relations
            if (schemeRow.hasTopConcept) {
              const topConcepts = schemeRow.hasTopConcept.split('|');
              for (const topConcept of topConcepts) {
                if (topConcept && topConcept.trim() !== 'null') {
                  quads.push(
                    this.df.quad(
                      conceptScheme,
                      ns.skos('hasTopConcept'),
                      this.df.namedNode(topConcept.trim()),
                    ),
                  );
                }
              }
            }

            // Process all concepts belonging to this scheme
            for (const conceptRow of conceptRows) {
              try {
                const rowQuads = this.createQuadsFromRow(conceptRow);
                quads.push(...rowQuads);
              } catch (error) {
                this.logger.error(
                  `Error processing concept row: ${error instanceof Error ? error.message : String(error)}`,
                );
                throw error;
              }
            }
          }

          // Process any remaining concepts that don't belong to a scheme
          for (const [index, row] of rows.entries()) {
            if (
              !conceptSchemeIndices.has(index) &&
              !row.inScheme &&
              row['@type'] === ns.skos('Concept').value
            ) {
              try {
                const rowQuads = this.createQuadsFromRow(row);
                quads.push(...rowQuads);
              } catch (error) {
                this.logger.error(
                  `Error processing concept row: ${error instanceof Error ? error.message : String(error)}`,
                );
                throw error;
              }
            }
          }

          resolve(quads);
        } catch (error) {
          reject(error);
        }
      });

      const readable = Readable.from([csvData.toString()]);
      readable.pipe(parser);
    });
  }

  private async writeOutput(): Promise<void> {
    const prefixes = await getPrefixes();
    const quads = this.store.findQuads(null, null, null, null);

    // Extract all unique namespaces used in the quads
    const usedNamespaces = new Set<string>();

    // Only extract from the object to prevent for example ns:rdf always being present
    for (const quad of quads) {
      extractNamespaces(quad.object, usedNamespaces);
      extractNamespaces(quad.predicate, usedNamespaces);
    }

    // Filter prefixes to only include those with namespaces present in quads
    const filteredPrefixes: Record<string, string> = {};
    for (const [prefix, namespace] of Object.entries(prefixes)) {
      if (usedNamespaces.has(namespace)) {
        filteredPrefixes[prefix] = namespace;
      }
    }

    const writer = new Writer({
      format: 'text/turtle',
      prefixes: filteredPrefixes,
    });
    writer.addQuads(quads);

    return new Promise((resolve, reject) => {
      writer.end(async (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        try {
          await writeFile(this.configuration.output, formatOutput(result));
          this.logger.info(`Output written to ${this.configuration.output}`);
          resolve();
        } catch (writeError) {
          reject(writeError);
        }
      });
    });
  }
}
