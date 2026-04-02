import * as path from 'path';

import {
  OutputFormat,
  QuadStore,
  Logger,
  ensureOutputDirectory,
  ns,
  getPrefixes,
} from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';
import { createWriteStream, writeFileSync } from 'fs';
import { inject, injectable } from 'inversify';
import { DataFactory } from 'rdf-data-factory';
import rdfSerializer from 'rdf-serialize';
import streamifyArray from 'streamify-array';

import { RmlGenerationServiceConfiguration } from './config/RmlGenerationServiceConfiguration';
import { RmlGenerationServiceIdentifier } from './config/RmlGenerationServiceIdentifier';
import { quadSort } from './utils/utils';

@injectable()
export class OutputHandlerService {
  public readonly config: RmlGenerationServiceConfiguration;
  public readonly logger: Logger;

  public constructor(
    @inject(RmlGenerationServiceIdentifier.Logger) logger: Logger,
    @inject(RmlGenerationServiceIdentifier.Configuration)
    config: RmlGenerationServiceConfiguration,
  ) {
    this.config = config;
    this.logger = logger;
  }

  private async generatePrefixMap(): Promise<Map<string, RDF.NamedNode>> {
    const prefixes = await getPrefixes();
    const map = new Map();
    const df = new DataFactory();

    for (const [prefix, url] of Object.entries(prefixes)) {
      /* generic vlaanderen prefix conflicts, for example: vlaanderen:persoon#GeregistreerdPersoon */
      if (prefix === 'vlaanderen') continue;
      map.set(prefix, df.namedNode(url));
    }

    return map;
  }

  public async write(store: QuadStore): Promise<void> {
    ensureOutputDirectory(this.config.output);

    for (const triplesMapId of store.findSubjects(
      ns.rdf('type'),
      ns.rml('TriplesMap'),
    )) {
      const triplesMapLabel = store.findObject(
        triplesMapId,
        ns.rdfs('label'),
      )?.value;

      if (!triplesMapLabel) {
        this.logger.error(
          `Cannot find label for Triples Map ${triplesMapId.value}`,
        );
        continue;
      }

      const quads: RDF.Quad[] = [];
      this.discoverTriplesMap(triplesMapId as RDF.NamedNode, quads, store);
      quads.sort(quadSort);

      const fileName: string = path.join(
        this.config.output,
        `${triplesMapLabel}.${this.getFileExtension()}`,
      );

      if (this.config.outputFormat === OutputFormat.turtle) {
        // Dynamic import required due to ESM/CommonJS compatibility issues
        const { default: Serializer } = await import(
          '@rdfjs/serializer-turtle'
        );

        const serializer = new Serializer({
          baseIRI: this.config.baseIRI,
          prefixes: (await this.generatePrefixMap()) as any,
        });
        const output = serializer.transform(quads);
        writeFileSync(fileName, output);
      } else {
        const quadStream = streamifyArray(quads);
        const outputStream = rdfSerializer.serialize(quadStream, {
          contentType: this.config.outputFormat,
        });
        outputStream.pipe(createWriteStream(fileName));
      }
    }
  }

  private getFileExtension(): string {
    switch (this.config.outputFormat) {
      case OutputFormat.JsonLd:
        return 'rml.jsonld';

      case OutputFormat.turtle:
        return 'rml.ttl';

      case OutputFormat.ntriples:
        return 'rml.nt';

      default:
        throw new Error(
          `Output format '${this.config.outputFormat}' is not supported.`,
        );
    }
  }

  private discoverTriplesMap(
    nodeId: RDF.NamedNode | RDF.BlankNode,
    quads: RDF.Quad[],
    store: QuadStore,
  ): void {
    for (const q of store.findQuads(nodeId, null, null)) {
      quads.push(q);
      if (
        (q.object.termType === 'NamedNode' ||
          q.object.termType === 'BlankNode') &&
        store.findObject(q.object, ns.rdf('type'))?.value !==
          ns.rml('TriplesMap').value
      ) {
        this.discoverTriplesMap(q.object, quads, store);
      }
    }
  }
}
