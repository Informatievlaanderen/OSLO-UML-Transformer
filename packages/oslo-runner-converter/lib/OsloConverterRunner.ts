import type { OsloEaConverterConfiguration } from '@oslo-flanders/configuration';
import type { Converter, OutputHandler, Runner } from '@oslo-flanders/core';
import { getLoggerFor } from '@oslo-flanders/core';
import { OsloEaUmlConverter, OsloJsonLdOutputHandler } from '@oslo-flanders/ea-converter';

export class OsloConverterRunner implements Omit<Runner<OsloEaConverterConfiguration>, 'generators'> {
  private readonly logger = getLoggerFor(this);
  public readonly configuration: OsloEaConverterConfiguration;
  public readonly converter: Converter<OsloEaConverterConfiguration>;
  public readonly converterOutputHandler: OutputHandler;

  public constructor(configuration: OsloEaConverterConfiguration) {
    this.configuration = configuration;
    this.converter = new OsloEaUmlConverter();
    this.converterOutputHandler = new OsloJsonLdOutputHandler();
  }

  public async init(): Promise<void> {
    this.logger.info('Starting initialization of converter.');
    this.converter.init(
      this.configuration,
      this.converterOutputHandler,
    );
  }

  public async start(): Promise<void> {
    this.logger.info('Starting conversion of UML diagram.');

    const start = new Date(Date.now());
    await this.converter.convert();
    const end = new Date(Date.now());

    this.logger.debug(`Conversion took ${Math.abs(end.getTime() - start.getTime())} ms.`);
  }
}
