import type { CliArgv } from '@oslo-flanders/core';
import { AppRunner, OutputFormat } from '@oslo-flanders/core';

import yargs from 'yargs';
import type { RdfVocabularyGenerationService } from '../lib/RdfVocabularyGenerationService';
import { container } from './config/DependencyInjectionConfig';
import type {
  RdfVocabularyGenerationServiceConfiguration,
} from './config/RdfVocabularyGenerationServiceConfiguration';

export class RdfVocabularyGenerationServiceRunner extends
  AppRunner<RdfVocabularyGenerationService, RdfVocabularyGenerationServiceConfiguration> {
  public async runCli(argv: CliArgv): Promise<void> {
    const yargv = yargs(argv.slice(2))
      .usage('node ./bin/runner.js [args]')
      .option('input', { describe: 'The input file to generate a JSON-LD context from.' })
      .option('output', { describe: 'Name of the output file.' })
      .option('language', { describe: 'The language in which the context must be generated.' })
      .option('contentType',
        {
          describe: 'The serialization format',
          default: OutputFormat.turtle,
          choices: [OutputFormat.turtle, OutputFormat.nquads, OutputFormat.ntriples, OutputFormat.JsonLd],
        })
      .option('silent',
        {
          describe: 'All logs are suppressed',
          default: false,
          boolean: true,
        })
      .demandOption(['input', 'output', 'language', 'contentType'])
      .help('h')
      .alias('h', 'help');

    const params = await yargv.parse();
    this.startApp(params, container).catch(error => console.error(error));
  }
}
