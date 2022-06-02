import type { GeneratorConfiguration } from '@oslo-flanders/configuration';
import { Generator } from '@oslo-flanders/core';

export class JsonLdContextGenerator extends Generator<GeneratorConfiguration> {
  public async generate(data?: any): Promise<void> {
    console.log(`Soon this will generate a JSON-LD context file`);
  }
}
