import type { CliArgv, Logger, LogLevel } from '@oslo-flanders/core';
import { AppRunner, LOG_LEVELS, ServiceIdentifier, VoidLogger, WinstonLogger } from '@oslo-flanders/core';
import yargs from 'yargs';
import { container } from './config/DependencyInjectionConfig';
import type { StakeholdersConversionServiceConfiguration } from './config/StakeholdersConversionServiceConfiguration';
import type { StakeholdersConversionService } from './StakeholdersConversionService';

export class StakeholdersConversionServiceRunner extends AppRunner {
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

    const configuration = container.get<StakeholdersConversionServiceConfiguration>(ServiceIdentifier.Configuration);
    await configuration.createFromCli(params);

    if (params.silent) {
      container.bind<Logger>(ServiceIdentifier.Logger)
        .to(VoidLogger);
    } else {
      container.bind<Logger>(ServiceIdentifier.Logger)
        .toDynamicValue(() => new WinstonLogger(<LogLevel>params.logLevel));
    }

    const conversionService = container.get<StakeholdersConversionService>(ServiceIdentifier.ConversionService);
    conversionService.run().catch(error => console.error(error));
  }
}
