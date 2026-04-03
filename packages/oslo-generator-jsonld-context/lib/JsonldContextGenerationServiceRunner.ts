import type { CliArgv } from '@oslo-flanders/core';
import { AppRunner } from '@oslo-flanders/core';

import { container } from './config/DependencyInjectionConfig';
import type { JsonldContextGenerationServiceConfiguration } from './config/JsonldContextGenerationServiceConfiguration';
import type { JsonldContextGenerationService } from './JsonldContextGenerationService';

export class JsonldContextGenerationServiceRunner extends AppRunner<
  JsonldContextGenerationService,
  JsonldContextGenerationServiceConfiguration
> {
  public async runCli(argv: CliArgv): Promise<void> {
    const yargv = this.createYargsInstance(argv.slice(2))
      .option('input', {
        describe: 'The input file to generate a JSON-LD context from.',
      })
      .option('output', {
        describe: 'Name of the output file.',
        default: 'context.jsonld',
      })
      .option('language', {
        describe: 'The language in which the context must be generated.',
      })
      .option('addDomainPrefix', {
        describe: 'Add the domain name as prefix for every property.',
        default: false,
        boolean: true,
      })
      .option('scopedContext', {
        describe: 'Create scoped contexts for each class',
        default: false,
        boolean: true,
      })
      .option('silent', {
        describe: 'All logs are suppressed',
        default: false,
        boolean: true,
      })
      .demandOption(['input', 'language'])
      .help('h')
      .alias('h', 'help');

    const params = await yargv.parse();
    this.startApp(params, container).catch((error) => console.error(error));
  }
}
