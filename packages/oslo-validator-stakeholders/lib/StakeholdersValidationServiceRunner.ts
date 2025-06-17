import type { CliArgv } from '@oslo-flanders/core';
import { AppRunner } from '@oslo-flanders/core';
import yargs from 'yargs';
import { container } from './config/DependencyInjectionConfig';
import type { StakeholdersValidationServiceConfiguration } from './config/StakeholdersValidationServiceConfiguration';
import type { StakeholdersValidationService } from './StakeholdersValidationService';

export class StakeholdersValidationServiceRunner extends AppRunner<
  StakeholdersValidationService,
  StakeholdersValidationServiceConfiguration
> {
  public async runCli(argv: CliArgv): Promise<void> {
    const yargv = yargs(argv.slice(2))
      .usage('node ./bin/runner.js [args]')
      .option('input', {
        describe: 'Local path or URL to stakeholders file to validate.',
      })
      .option('format', {
        describe: 'Input format of the stakeholders file: application/json or application/ld+json.',
      })
      .demandOption(['input'])
      .help('h')
      .alias('h', 'help');

    const params = await yargv.parse();
    this.startApp(params, container).catch((error) => console.error(error));
  }
}
