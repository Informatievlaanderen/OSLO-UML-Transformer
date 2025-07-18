/* eslint-disable eslint-comments/disable-enable-pair */
 
import { createWriteStream } from 'fs';
import { OutputFormat, type IOutputHandler, type QuadStore } from '@oslo-flanders/core';
import { inject, injectable } from 'inversify';
import { EaUmlConverterConfiguration } from './config/EaUmlConverterConfiguration';
import { EaUmlConverterServiceIdentifier } from './config/EaUmlConverterServiceIdentifier';
import { JsonLdOutputHandler } from './output-handlers/JsonLdOutputHandler';

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
      case OutputFormat.JsonLd:
        return new JsonLdOutputHandler();

      default:
        throw new Error(`Output format ${config.outputFormat} is not supported.`);
    }
  }

  public async write(store: QuadStore): Promise<void> {
    const writeStream: any = this.configuration.outputFile ?
      createWriteStream(this.configuration.outputFile) :
      process.stdout;
    await this.outputHandler.write(store, writeStream);
  }
}
