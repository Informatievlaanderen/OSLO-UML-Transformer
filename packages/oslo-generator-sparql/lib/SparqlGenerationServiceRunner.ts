import type { CliArgv } from '@oslo-flanders/core';
import { AppRunner } from '@oslo-flanders/core';

import type { SparqlGenerationService } from '../lib/SparqlGenerationService';
import { container } from './config/DependencyInjectionConfig';
import type { SparqlGenerationServiceConfiguration } from './config/SparqlGenerationServiceConfiguration';

export class SparqlGenerationServiceRunner extends AppRunner<
  SparqlGenerationService,
  SparqlGenerationServiceConfiguration
> {
  public async runCli(argv: CliArgv): Promise<void> {
    const yargv = this.createYargsInstance(argv.slice(2))
      .option('input', {
        describe: 'The input file to generate SPARQL queries from.',
        default: 'input.jsonld',
      })
      .option('output', {
        describe:
          'Name of the output directory where all the queries will be written to.',
        default: 'queries',
      })
      .option('language', {
        describe: 'Language tag to use.',
        default: 'nl',
      })
      .option('silent', {
        describe: 'All logs are suppressed',
        default: false,
        boolean: true,
      })
      .demandOption(['input', 'output'])
      .help('h')
      .alias('h', 'help');

    const params = await yargv.parse();
    this.startApp(params, container).catch((error) => console.error(error));
  }
}
