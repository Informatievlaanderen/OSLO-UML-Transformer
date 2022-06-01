import type { Converter } from '@oslo-flanders/core';
import { getLoggerFor } from '@oslo-flanders/core';
import type { IApp } from './IApp';

const DEFAULT_CONVERTER = '@oslo-flanders/ea-converter';

type ConverterConfiguration = Record<string, unknown>;

type AppConfiguration<T extends ConverterConfiguration> = T & {
  'converterPackageName'?: string;
};

export class ConverterApp<P extends AppConfiguration<ConverterConfiguration>> implements IApp {
  private readonly logger = getLoggerFor(this);
  private readonly appConfig: P;
  private converter: Converter<ConverterConfiguration> | undefined;

  public constructor(config: P) {
    this.appConfig = config;
  }

  public async init(): Promise<void> {
    this.logger.info('Initialising the converter');
    let configuredConverter = this.appConfig.converterPackageName;

    if (!configuredConverter) {
      this.logger.warn(`No converter package name was set in configuration. Setting default: ${DEFAULT_CONVERTER}`);
      configuredConverter = DEFAULT_CONVERTER;
    }

    this.converter = this.resolveConnector(configuredConverter);

    // Remove property so that it is not available in converter itself
    delete this.appConfig.converterPackageName;
    this.converter.init(<ConverterConfiguration>this.appConfig);
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
