import type { CliArgv } from '@oslo-flanders/core';
import { AppRunner } from '@oslo-flanders/core';
import yargs from 'yargs';
import { container } from './config/DependencyInjectionConfig';
import type { HtmlGenerationServiceConfiguration } from './config/HtmlGenerationServiceConfiguration';
import type { HtmlGenerationService } from './HtmlGenerationService';

export class HtmlGenerationServiceRunner extends AppRunner<
  HtmlGenerationService,
  HtmlGenerationServiceConfiguration
> {
  public async runCli(argv: CliArgv): Promise<void> {
    const yargv = yargs(argv.slice(2))
      .usage('node ./bin/runner.js [args]')
      .option('input', {
        describe: 'The webuniversum input file to generate an HTML file for.',
      })
      .option('output', {
        describe: 'Name of the output file.',
        default: 'index.html',
      })
      .option('metadata', {
        describe: 'Input file containing metadata about the publication.',
      })
      .option('stakeholders', {
        describe: 'JSON file with stakeholders',
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
        default: 'Applicatieprofiel',
      })
      .option('silent', {
        describe: 'All logs are suppressed',
        default: false,
        boolean: true,
      })
      .option('summary', {
        describe: 'Input file containing the summary of the publication',
        type: 'string',
      })
      .demandOption(['input', 'metadata', 'language', 'stakeholders'])
      .help('h')
      .alias('h', 'help');

    const params = await yargv.parse();
    this.startApp(params, container).catch((error) => console.error(error));
  }
}
