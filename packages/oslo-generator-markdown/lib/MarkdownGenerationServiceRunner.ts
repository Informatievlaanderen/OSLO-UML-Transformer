import type { CliArgv } from '@oslo-flanders/core';
import { AppRunner } from '@oslo-flanders/core';

import type { MarkdownGenerationService } from './MarkdownGenerationService';
import { container } from './config/DependencyInjectionConfig';
import type { MarkdownGenerationServiceConfiguration } from './config/MarkdownGenerationServiceConfiguration';

export class MarkdownGenerationServiceRunner extends AppRunner<
  MarkdownGenerationService,
  MarkdownGenerationServiceConfiguration
> {
  public async runCli(argv: CliArgv): Promise<void> {
    const yargv = this.createYargsInstance(argv.slice(2))
      .option('input', {
        describe: 'The input file to generate SPARQL queries from.',
        default: 'input.jsonld',
      })
      .option('output', {
        describe:
          'Name of the output directory where all the queries will be written to.',
        default: 'output',
      })
      .option('language', {
        describe: 'Language tag to use.',
        default: 'nl',
      })
      .option('baseURI', {
        describe: 'Used when building profile-specific information.',
        default: 'https://data.vlaanderen.be',
      })
      .option('silent', {
        describe: 'All logs are suppressed',
        default: false,
        boolean: true,
      })
      .demandOption(['input', 'output'])
      .help('h')
      .alias('h', 'help');

    const params = await yargv.parse();
    this.startApp(params, container).catch((error) => console.error(error));
  }
}
