import type { GeneratorConfiguration } from '@oslo-flanders/configuration';
import type { IApp } from './IApp';

export class GeneratorApp implements IApp {
  private readonly config: GeneratorConfiguration;

  public constructor(config: GeneratorConfiguration) {
    this.config = config;
  }

  public async init(): Promise<void> {
    console.log('Method not yet implemented');
  }

  public async start(): Promise<void> {
    console.log('Method not yet implemented');
  }
}
