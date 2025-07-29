import type { CliArgv } from '@oslo-flanders/core';
import { AppRunner } from '@oslo-flanders/core';
import yargs from 'yargs';
import { container } from './config/DependencyInjectionConfig';
import type { JsonldValidationServiceConfiguration } from './config/JsonldValidationServiceConfiguration';
import type { JsonldValidationService } from './JsonldValidationService';

export class JsonldValidationServiceRunner extends AppRunner<
  JsonldValidationService,
  JsonldValidationServiceConfiguration
> {
  public async runCli(argv: CliArgv): Promise<void> {
    const yargv = yargs(argv.slice(2))
      .usage('node ./bin/runner.js [args]')
      .option('input', {
        describe: 'Local path or URL to JSON-LD file to validate.',
      })
      .option('whitelist', {
        describe:
          'Local path or URL to whitelist file (JSON array of URI prefixes).',
      })
      .option('publicationEnvironment', {
        describe:
          'The base URI of environment where the document will be published',
      })
      .demandOption(['input', 'whitelist', 'publicationEnvironment'])
      .help('h')
      .alias('h', 'help');

    const params = await yargv.parse();
    this.startApp(params, container).catch((error) => console.error(error));
  }
}
