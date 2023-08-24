import type { CliArgv } from '@oslo-flanders/core';
import { AppRunner } from '@oslo-flanders/core';

import yargs, { options } from 'yargs';
import { container } from './config/DependencyInjectionConfig';
import { HtmlWebcomponentsV2GenerationService } from './HtmlWebcomponentsV2GenerationService';
import { HtmlWebcomponentsV2GenerationServiceConfiguration } from './config/HtmlWebcomponentsV2GenerationServiceConfiguration';

export class HtmlWebcomponentsV2GenerationServiceRunner extends AppRunner<
  HtmlWebcomponentsV2GenerationService,
  HtmlWebcomponentsV2GenerationServiceConfiguration
> {
  public async runCli(argv: CliArgv): Promise<void> {
    const yargv = yargs(argv.slice(2))
      .usage('node ./bin/runner.js [args]')
      .option('input', {
        describe: 'The input file to generate a JSON-LD context from.',
      })
      .option('output', {
        describe: 'Name of the output file.',
        default: 'output.html',
      })
      .option('specificationType', {
        describe: 'The specification type to generate an HTML page for',
        options: ['ApplicationProfile', 'Vocabulary'],
      })
      .option('language', {
        describe: 'The language of the labels to be extracted from the OSLO JSON-LD',
      })
      .option('silent', {
        describe: 'All logs are suppressed',
        default: false,
        boolean: true,
      })
      .demandOption(['input', 'specificationType', 'language'])
      .help('h')
      .alias('h', 'help');

    const params = await yargv.parse();
    this.startApp(params, container).catch((error) => console.error(error));
  }
}
