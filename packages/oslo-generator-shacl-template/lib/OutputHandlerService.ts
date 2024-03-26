import { inject, injectable } from "inversify";
import { ShaclTemplateGenerationServiceConfiguration } from "@oslo-generator-shacl-template/config/ShaclTemplateGenerationServiceConfiguration";
import { ShaclTemplateGenerationServiceIdentifier } from "@oslo-generator-shacl-template/config/ShaclTemplateGenerationServiceIdentifier";
import { QuadStore } from "@oslo-flanders/core";
import { createWriteStream } from "fs";
import rdfSerializer from "rdf-serialize";

@injectable()
export class OutputHandlerService {
  @inject(ShaclTemplateGenerationServiceIdentifier.Configuration)
  public readonly config!: ShaclTemplateGenerationServiceConfiguration;

  public async write(store: QuadStore): Promise<void> {
    const quadStream = require('streamify-array')(store.findQuads(null, null, null, null));
    const outputStream = rdfSerializer.serialize(quadStream, { contentType: this.config.outputFormat });

    let fileName: string = this.config.output ? this.config.output : `shacl.${this.getFileExtension()}`;
    outputStream.pipe(createWriteStream(fileName))
  }

  private getFileExtension(): string {
    switch (this.config.outputFormat) {
      case 'application/ld+json':
        return 'jsonld';

      case 'text/turtle':
        return 'ttl';

      case 'application/n-triples':
        return 'nt';

      default:
        throw new Error(`Output format '${this.config.outputFormat}' is not supported.`);
    }
  }
}