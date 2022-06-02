import type { Generator } from '@oslo-flanders/core';
import { fetchFileOrUrl, getLoggerFor } from '@oslo-flanders/core';

import type { IApp } from './IApp';

const DEFAULT_GENERATORS = [
  '@oslo-flanders/jsonld-context-generator',
];

type GeneratorConfiguration = Record<string, unknown>;

type AppConfiguration<T extends GeneratorConfiguration> = T & {
  'generatorPackageName'?: string | string[];
  'inputFile': string;
};

export class GeneratorApp<P extends AppConfiguration<GeneratorConfiguration>> implements IApp {
  private readonly logger = getLoggerFor(this);
  private readonly appConfig: P;
  private generators: Generator<GeneratorConfiguration>[] | undefined;

  public constructor(config: P) {
    this.appConfig = config;
  }

  public async init(): Promise<void> {
    this.logger.info(`Initiliazing generator(s).`);

    let configuredGenerators: string[];

    if (!this.appConfig.generatorPackageName) {
      this.logger.warn(`No generators were set in the configuration. Setting default generators: ${DEFAULT_GENERATORS}`);
      configuredGenerators = DEFAULT_GENERATORS;
    } else {
      configuredGenerators = Array.isArray(this.appConfig.generatorPackageName) ?
        this.appConfig.generatorPackageName :
        [this.appConfig.generatorPackageName];
    }

    this.generators = this.resolveGenerators(configuredGenerators);

    // Remove property as it should not be available for the generators
    delete this.appConfig.generatorPackageName;

    const tasks: Promise<void>[] = [];
    this.generators.forEach(x => tasks.push(x.init(this.appConfig)));

    await Promise.all(tasks);
  }

  public async start(): Promise<void> {
    this.logger.info('Starting generation of artefacts.');
    const start = new Date(Date.now());
    const buffer = await fetchFileOrUrl(this.appConfig.inputFile);

    const tasks: Promise<void>[] = [];
    this.generators?.forEach(x => tasks.push(x.generate(buffer.toString())));

    await Promise.all(tasks);
    const end = new Date(Date.now());

    this.logger.debug(`Generation of all artefacts took ${Math.abs(end.getTime() - start.getTime())} ms.`);
  }

  public resolveGenerators(packageNames: string[]): Generator<GeneratorConfiguration>[] {
    return packageNames.map(packageName => {
      const GeneratorPackage = require(packageName);
      const generatorName = Object.keys(GeneratorPackage).find(key => key.endsWith('Generator'));

      if (!generatorName) {
        throw new Error(`Generator ${packageName} could not be loaded correctly!`);
      }

      return new GeneratorPackage[generatorName]();
    });
  }
}
