import type { CliArgv } from '@oslo-flanders/core';
import { AppRunner } from '@oslo-flanders/core';

import yargs from 'yargs';
import { container } from '@oslo-generator-jsonld-context/config/DependencyInjectionConfig';
import type {
  JsonldContextGenerationServiceConfiguration,
} from '@oslo-generator-jsonld-context/config/JsonldContextGenerationServiceConfiguration';
import type { JsonldContextGenerationService } from '@oslo-generator-jsonld-context/JsonldContextGenerationService';

export class JsonldContextGenerationServiceRunner extends
  AppRunner<JsonldContextGenerationService, JsonldContextGenerationServiceConfiguration> {
  public async runCli(argv: CliArgv): Promise<void> {
    const yargv = yargs(argv.slice(2))
      .usage('node ./bin/runner.js [args]')
      .option('input', { describe: 'The input file to generate a JSON-LD context from.' })
      .option('output', { describe: 'Name of the output file.', default: 'context.jsonld' })
      .option('language', { describe: 'The language in which the context must be generated.' })
      .option('addDomainPrefix',
        {
          describe: 'Add the domain name as prefix for every property.',
          default: false,
          boolean: true,
        })
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
