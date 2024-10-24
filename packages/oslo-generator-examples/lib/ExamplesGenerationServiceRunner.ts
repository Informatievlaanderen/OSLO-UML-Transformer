import type { CliArgv } from '@oslo-flanders/core';
import { AppRunner } from '@oslo-flanders/core';
import yargs from 'yargs';
import { container } from './config/DependencyInjectionConfig';
import type { ExamplesGenerationServiceConfiguration } from './config/ExamplesGenerationServiceConfiguration';
import type { ExamplesGenerationService } from './ExamplesGenerationService';

export class ExamplesGenerationServiceRunner extends AppRunner<
  ExamplesGenerationService,
  ExamplesGenerationServiceConfiguration
> {
  public async runCli(argv: CliArgv): Promise<void> {
    const yargv = yargs(argv.slice(2))
      .usage('node ./bin/runner.js [args]')
      .option('input', {
        describe: 'The input file to generate the examples for.',
      })
      .option('output', {
        describe:
          'Name of the output file. By default, a file in the chosen output format will be created',
      })
      .option('contextbase', {
        describe:
          'the public base url on which the context of the jsons are published. Without trailing /',
      })
      .option('language', {
        describe: 'The language in which the examples must be generated.',
      })
      .option('silent', {
        describe: 'All logs are suppressed',
        default: false,
        boolean: true,
      })
      .demandOption(['input', 'output', 'contextbase', 'language'])
      .help('h')
      .alias('h', 'help');

    const params = await yargv.parse();
    this.startApp(params, container).catch((error) => console.error(error));
  }
}
