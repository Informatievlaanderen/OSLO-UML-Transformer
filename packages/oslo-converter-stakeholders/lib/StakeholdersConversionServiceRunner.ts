import type { CliArgv } from '@oslo-flanders/core';
import { AppRunner, LOG_LEVELS, OutputFormat } from '@oslo-flanders/core';
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
        default: OutputFormat.JsonLd,
        choices: [OutputFormat.JsonLd, OutputFormat.Json],
      })
      .option('iri', {
        describe:
          'IRI of the specification of which these stakeholders are part of.',
      })
      .demandOption(
        ['input'],
        'Please provide the necessary arguments to work with this tool.',
      )
      .check((args) => {
        if (args.outputFormat === OutputFormat.JsonLd) {
          throw new Error(
            `--iri is required when outputFormat is ${OutputFormat.JsonLd}}`,
          );
        }
      })
      .help('h')
      .alias('h', 'help');

    const params = await yargv.parse();
    this.startApp(params, container).catch((error) => console.error(error));
  }
}
