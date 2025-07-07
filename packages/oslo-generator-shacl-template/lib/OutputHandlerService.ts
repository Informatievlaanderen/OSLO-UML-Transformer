import { inject, injectable } from 'inversify';
import { ShaclTemplateGenerationServiceConfiguration } from './config/ShaclTemplateGenerationServiceConfiguration';
import { ShaclTemplateGenerationServiceIdentifier } from './config/ShaclTemplateGenerationServiceIdentifier';
import { OutputFormat, QuadStore } from '@oslo-flanders/core';
import { createWriteStream } from 'fs';
import rdfSerializer from 'rdf-serialize';
import { DataFactory } from 'rdf-data-factory';
import { quadSort } from './utils/utils';
import streamifyArray from 'streamify-array';

@injectable()
export class OutputHandlerService {
  public readonly config: ShaclTemplateGenerationServiceConfiguration;

  public constructor(
    @inject(ShaclTemplateGenerationServiceIdentifier.Configuration)
    config: ShaclTemplateGenerationServiceConfiguration
  ) {
    this.config = config;
  }

  public async write(store: QuadStore): Promise<void> {
    const df: DataFactory = new DataFactory();
    let quads = [
      ...store.findQuads(null, null, null, df.defaultGraph()),
      ...store
        .findQuads(null, null, null, df.namedNode('baseQuadsGraph'))
        .map((quad) => df.quad(quad.subject, quad.predicate, quad.object)),
    ].sort(quadSort);

    const quadStream = streamifyArray(quads);
    const outputStream = rdfSerializer.serialize(quadStream, {
      contentType: this.config.outputFormat,
    });

    let fileName: string = this.config.output
      ? this.config.output
      : `shacl.${this.getFileExtension()}`;
    outputStream.pipe(createWriteStream(fileName));
  }

  private getFileExtension(): string {
    switch (this.config.outputFormat) {
      case OutputFormat.JsonLd:
        return 'jsonld';

      case OutputFormat.turtle:
        return 'ttl';

      case OutputFormat.ntriples:
        return 'nt';

      default:
        throw new Error(
          `Output format '${this.config.outputFormat}' is not supported.`
        );
    }
  }
}
