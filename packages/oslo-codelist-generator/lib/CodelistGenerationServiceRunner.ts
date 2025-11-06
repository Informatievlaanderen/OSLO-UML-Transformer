import { AppRunner, LOG_LEVELS } from '@oslo-flanders/core';
import type { CliArgv } from '@oslo-flanders/core';
import yargs from 'yargs';
import type { CodelistGenerationServiceConfiguration } from '../config/CodelistGenerationServiceConfiguration';
import { container } from '../config/DependencyInjectionConfig';
import type { CodelistGenerationService } from './CodelistGenerationService';

export class CodelistGenerationServiceRunner extends AppRunner<
  CodelistGenerationService,
  CodelistGenerationServiceConfiguration
> {
  public async runCli(argv: CliArgv): Promise<void> {
    const yargv = yargs(argv.slice(2))
      .usage('node ./bin/runner.js [args]')
      .option('input', {
        describe: 'URL or local path to a CSV file containing codelist data.',
      })
      .option('output', {
        describe: 'Local path to write the output file to',
        default: 'codelist.ttl',
      })
      .option('language', {
        describe: 'Language for the codelist labels and definitions',
        default: 'nl',
      })
      .option('labelColumn', {
        describe: 'Name of the column containing label values',
        default: 'prefLabel',
      })
      .option('definitionColumn', {
        describe: 'Name of the column containing definition values',
        default: 'definition',
      })
      .option('notationColumn', {
        describe: 'Name of the column containing notation values',
        default: 'notation',
      })
      .option('narrowerColumn', {
        describe: 'Name of the column containing narrower concept references',
        default: 'narrower',
      })
      .option('broaderColumn', {
        describe: 'Name of the column containing broader concept references',
        default: 'broader',
      })
      .option('statusColumn', {
        describe: 'Name of the column containing status information',
        default: 'status',
      })
      .option('datasetColumn', {
        describe: 'Name of the column containing dataset information',
        default: 'dataset',
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
