import type { CliArgv } from '@oslo-flanders/core';
import { AppRunner } from '@oslo-flanders/core';
import { container } from './config/DependencyInjectionConfig';
import type { HtmlRespecGenerationServiceConfiguration } from './config/HtmlRespecGenerationServiceConfiguration';
import type { HtmlRespecGenerationService } from './HtmlRespecGenerationService';

export class HtmlRespecGenerationServiceRunner extends AppRunner<
  HtmlRespecGenerationService,
  HtmlRespecGenerationServiceConfiguration
> {
  public async runCli(argv: CliArgv): Promise<void> {
    const yargv = this.createYargsInstance(argv.slice(2))
      .option('input', {
        describe: 'The input file to generate an HTML file for.',
      })
      .option('output', {
        describe: 'Name of the output file.',
        default: 'respec.html',
      })
      .option('language', {
        describe: 'The language in which the HTML must be generated.',
      })
      .option('specificationType', {
        describe: 'The specification type to generate an HTML page for',
        choices: ['ApplicationProfile', 'Vocabulary'],
        default: 'Vocabulary',
      })
      .option('specificationName', {
        describe: 'The name of the specification',
      })
      .option('silent', {
        describe: 'All logs are suppressed',
        default: false,
        boolean: true,
      })
      .demandOption(['input', 'language', 'specificationName'])
      .help('h')
      .alias('h', 'help');

    const params = await yargv.parse();
    this.startApp(params, container).catch((error) => console.error(error));
  }
}
