import type { CliArgv } from '@oslo-flanders/core';
import { AppRunner, SpecificationType } from '@oslo-flanders/core';
import { container } from './config/DependencyInjectionConfig';
import type { JsonldValidationServiceConfiguration } from './config/JsonldValidationServiceConfiguration';
import type { JsonldValidationService } from './JsonldValidationService';

export class JsonldValidationServiceRunner extends AppRunner<
  JsonldValidationService,
  JsonldValidationServiceConfiguration
> {
  public async runCli(argv: CliArgv): Promise<void> {
    const yargv = this.createYargsInstance(argv.slice(2))
      .option('input', {
        describe: 'Local path or URL to JSON-LD file to validate.',
      })
      .option('specificationType', {
        describe: 'Type of the document.',
        choices: [
          SpecificationType.ApplicationProfile,
          SpecificationType.Vocabulary,
        ],
      })
      .option('whitelist', {
        describe:
          'Local path or URL to whitelist file (JSON array of URI prefixes).',
      })
      .demandOption(['input', 'whitelist'])
      .help('h')
      .alias('h', 'help');

    const params = await yargv.parse();
    this.startApp(params, container).catch((error) => console.error(error));
  }
}
