import type { CliArgv } from '@oslo-flanders/core';
import { AppRunner } from '@oslo-flanders/core';

import yargs from 'yargs';
import type { RmlGenerationService } from '../lib/RmlGenerationService';
import { container } from './config/DependencyInjectionConfig';
import type { RmlGenerationServiceConfiguration } from './config/RmlGenerationServiceConfiguration';

export class RmlGenerationServiceRunner extends AppRunner<
  RmlGenerationService,
  RmlGenerationServiceConfiguration
> {
  public async runCli(argv: CliArgv): Promise<void> {
    const yargv = yargs(argv.slice(2))
      .usage('node ./bin/runner.js [args]')
      .option('input', {
        describe:
          'The input file to generate RML mapping templates from.',
        default: 'input.jsonld',
      })
      .option('output', {
        describe: 'Name of the output directory where all the mapping templates will be written to.',
        default: 'mappings',
      })
      .option('language', {
        describe: 'Language tag to use.',
        default: 'nl',
      })
      .option('outputFormat', {
        describe: 'Output format to use for the RML mappings.',
        default: 'text/turtle',
      })
      .option('silent', {
        describe: 'All logs are suppressed',
        default: false,
        boolean: true,
      })
      .demandOption([
        'input',
        'output',
      ])
      .help('h')
      .alias('h', 'help');

    const params = await yargv.parse();
    this.startApp(params, container).catch((error) => console.error(error));
  }
}
