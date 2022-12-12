/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/indent */
import { createWriteStream } from 'fs';
import type { IOutputHandler } from '@oslo-flanders/core';
import { JsonLdOutputHandler, NQuadsOutputHandler } from '@oslo-flanders/output-handlers';
import { inject, injectable } from 'inversify';
import type { Quad, Store } from 'n3';
import { EaUmlConverterConfiguration } from './config/EaUmlConverterConfiguration';
import { EaUmlConverterServiceIdentifier } from './config/EaUmlConverterServiceIdentifier';

@injectable()
export class OutputHandlerService {
  public readonly configuration: EaUmlConverterConfiguration;
  public readonly outputHandler: IOutputHandler;

  public constructor(
    @inject(EaUmlConverterServiceIdentifier.Configuration) config: EaUmlConverterConfiguration,
  ) {
    this.configuration = config;
    this.outputHandler = this.loadOutputHandler(config);
  }

  private loadOutputHandler(config: EaUmlConverterConfiguration): IOutputHandler {
    switch (config.outputFormat) {
      case 'application/ld+json':
        return new JsonLdOutputHandler();

      case 'application/n-quads':
        return new NQuadsOutputHandler();

      default:
        throw new Error(`Output format ${config.outputFormat} is not supported.`);
    }
  }

  public async write(store: Store<Quad>): Promise<void> {
    const writeStream: any = this.configuration.outputFile ?
      createWriteStream(this.configuration.outputFile) :
      process.stdout;
    await this.outputHandler.write(store, writeStream);
  }
}
