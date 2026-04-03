import type { CliArgv } from '@oslo-flanders/core';
import { AppRunner, OutputFormat } from '@oslo-flanders/core';
import { container } from './config/DependencyInjectionConfig';
import type { StakeholdersValidationServiceConfiguration } from './config/StakeholdersValidationServiceConfiguration';
import type { StakeholdersValidationService } from './StakeholdersValidationService';

export class StakeholdersValidationServiceRunner extends AppRunner<
  StakeholdersValidationService,
  StakeholdersValidationServiceConfiguration
> {
  public async runCli(argv: CliArgv): Promise<void> {
    const yargv = this.createYargsInstance(argv.slice(2))
      .option('input', {
        describe: 'Local path or URL to stakeholders file to validate.',
      })
      .option('format', {
        describe: `Input format of the stakeholders file: ${OutputFormat.Json} or ${OutputFormat.JsonLd}.`,
        choices: [OutputFormat.Json, OutputFormat.JsonLd],
      })
      .demandOption(['input'])
      .help('h')
      .alias('h', 'help');

    const params = await yargv.parse();
    this.startApp(params, container).catch((error) => console.error(error));
  }
}
