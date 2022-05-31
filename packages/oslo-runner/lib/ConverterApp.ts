import type { ConverterConfiguration } from '@oslo-flanders/configuration';
import type { Converter } from '@oslo-flanders/core';
import { getLoggerFor } from '@oslo-flanders/core';
import type { IApp } from './IApp';

const DEFAULT_CONVERTER = '@oslo-flanders/ea-converter';

export class ConverterApp implements IApp {
  private readonly logger = getLoggerFor(this);
  private readonly config: ConverterConfiguration;
  private converter: Converter<ConverterConfiguration> | undefined;

  public constructor(config: ConverterConfiguration) {
    this.config = config;
  }

  public async init(): Promise<void> {
    this.logger.info('Initialising the converter');
    let configuredConverter = this.config.converterPackageName;

    if (!configuredConverter) {
      this.logger.warn(`No converter package name was set in configuration. Setting default: ${DEFAULT_CONVERTER}`);
      configuredConverter = DEFAULT_CONVERTER;
    }

    this.converter = this.resolveConnector(configuredConverter);
    this.converter.init(this.config);
  }

  public async start(): Promise<void> {
    this.logger.info('Starting conversion of the UML diagram.');

    const start = new Date(Date.now());
    await this.converter?.convert();
    const end = new Date(Date.now());

    this.logger.debug(`Conversion took ${Math.abs(end.getTime() - start.getTime())} ms.`);
  }

  public resolveConnector(packageName: string): Converter<ConverterConfiguration> {
    const ConverterPackage = require(packageName);
    const converterName = Object.keys(ConverterPackage).find(key => key.endsWith('Converter'));

    if (!converterName) {
      throw new Error(`Connector ${packageName} could not be loaded correctly!`);
    }

    return new ConverterPackage[converterName]();
  }
}
