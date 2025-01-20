import type { CliArgv } from '@oslo-flanders/core';
import { AppRunner, LOG_LEVELS } from '@oslo-flanders/core';
import yargs from 'yargs';
import { container } from './config/DependencyInjectionConfig';
import type { StakeholdersConversionServiceConfiguration } from './config/StakeholdersConversionServiceConfiguration';
import type { StakeholdersConversionService } from './StakeholdersConversionService';

export class StakeholdersConversionServiceRunner extends AppRunner<
  StakeholdersConversionService,
  StakeholdersConversionServiceConfiguration
> {
  public async runCli(argv: CliArgv): Promise<void> {
    const yargv = yargs(argv.slice(2))
      .usage('node ./bin/runner.js [args]')
      .option('input', {
        describe: 'URL or local path to an OSLO stakeholders csv file.',
      })
      .option('output', {
        describe: 'Name of the output file',
        default: 'stakeholders.jsonld',
      })
      .option('contributorsColumn', {
        describe: 'Name of the contributors column.',
        default: 'MijnKolom',
      })
      .option('silent', {
        describe: 'All logs are suppressed',
        default: false,
        boolean: true,
      })
      .option('logLevel', {
        describe: 'Log only if level is less than or equal to this level',
        default: 'info',
        choices: LOG_LEVELS,
      })
      .option('outputFormat', {
        describe: 'Define the output format',
        default: 'application/ld+json',
        choices: ['application/ld+json', 'application/json'],
      })
      .demandOption(
        ['input'],
        'Please provide the necessary arguments to work with this tool.',
      )
      .help('h')
      .alias('h', 'help');

    const params = await yargv.parse();
    this.startApp(params, container).catch((error) => console.error(error));
  }
}
