import type { CliArgv } from '@oslo-flanders/core';
import { AppRunner } from '@oslo-flanders/core';
import yargs from 'yargs';
import { container } from './config/DependencyInjectionConfig';
import type { HtmlRespecGenerationServiceConfiguration } from './config/HtmlRespecGenerationServiceConfiguration';
import type { HtmlRespecGenerationService } from './HtmlRespecGenerationService';

export class HtmlRespecGenerationServiceRunner extends
  AppRunner<HtmlRespecGenerationService, HtmlRespecGenerationServiceConfiguration> {
  public async runCli(argv: CliArgv): Promise<void> {
    const yargv = yargs(argv.slice(2))
      .usage('node ./bin/runner.js [args]')
      .option('input', { describe: 'The input file to generate an HTML file for.' })
      .option('output', { describe: 'Name of the output file.', default: 'respec.html' })
      .option('language', { describe: 'The language in which the HTML must be generated.' })
      .option('silent',
        {
          describe: 'All logs are suppressed',
          default: false,
          boolean: true,
        })
      .demandOption(['input', 'language'])
      .help('h')
      .alias('h', 'help');

    const params = await yargv.parse();
    this.startApp(params, container).catch(error => console.error(error));
  }
}
