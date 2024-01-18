import type { CliArgv } from '@oslo-flanders/core';
import { AppRunner, LOG_LEVELS } from '@oslo-flanders/core';
import yargs from 'yargs';
import { container } from '@oslo-converter-stakeholders/config/DependencyInjectionConfig';
import type {
  StakeholdersConversionServiceConfiguration,
} from '@oslo-converter-stakeholders/config/StakeholdersConversionServiceConfiguration';
import type { StakeholdersConversionService } from '@oslo-converter-stakeholders/StakeholdersConversionService';

export class StakeholdersConversionServiceRunner extends
  AppRunner<StakeholdersConversionService, StakeholdersConversionServiceConfiguration> {
  public async runCli(argv: CliArgv): Promise<void> {
    const yargv = yargs(argv.slice(2))
      .usage('node ./bin/runner.js [args]')
      .option('input', { describe: 'URL or local path to an OSLO stakeholders csv file.' })
      .option('output',
        {
          describe: 'Name of the output file',
          default: 'stakeholders.jsonld',
        })
      .option('silent',
        {
          describe: 'All logs are suppressed',
          default: false,
          boolean: true,
        })
      .option('logLevel', {
        describe: 'Log only if level is less than or equal to this level',
        default: 'info',
        choices: LOG_LEVELS,
      })
      .demandOption(['input'],
        'Please provide the necessary arguments to work with this tool.')
      .help('h')
      .alias('h', 'help');

    const params = await yargv.parse();
    this.startApp(params, container).catch(error => console.error(error));
  }
}
