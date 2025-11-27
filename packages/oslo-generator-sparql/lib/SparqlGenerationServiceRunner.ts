import type { CliArgv } from '@oslo-flanders/core';
import { AppRunner } from '@oslo-flanders/core';

import yargs from 'yargs';
import type { SparqlGenerationService } from '../lib/SparqlGenerationService';
import { container } from './config/DependencyInjectionConfig';
import type { SparqlGenerationServiceConfiguration } from './config/SparqlGenerationServiceConfiguration';

export class SparqlGenerationServiceRunner extends AppRunner<
  SparqlGenerationService,
  SparqlGenerationServiceConfiguration
> {
  public async runCli(argv: CliArgv): Promise<void> {
    const yargv = yargs(argv.slice(2))
      .usage('node ./bin/runner.js [args]')
      .option('input', {
        describe:
          'The input file to generate a Sparql OpenAPI JSON file from.',
        default: 'input.jsonld',
      })
      .option('output', {
        describe: 'Name of the output file.',
        default: 'openapi.json',
      })
      .option('versionSparql', {
        describe: 'Version of the Sparql specification used for generation.',
      })
      .option('versionAPI', { describe: 'API version.' })
      .option('language', { describe: 'API language tag.', default: 'nl' })
      .option('title', { describe: 'API title.' })
      .option('description', { describe: 'API description.' })
      .option('contextURL', { describe: 'API JSON-LD Context URL.' })
      .option('baseURL', { describe: 'API base URL.' })
      .option('contactName', { describe: 'API contact name.' })
      .option('contactEmail', { describe: 'API contact e-mail.' })
      .option('contactURL', { describe: 'API contact URL.' })
      .option('licenseName', { describe: 'API license name.' })
      .option('licenseURL', { describe: 'API license URL.' })
      .option('silent', {
        describe: 'All logs are suppressed',
        default: false,
        boolean: true,
      })
      .demandOption([
        'input',
        'output',
        'versionSparql',
        'versionAPI',
        'title',
        'contextURL',
        'baseURL',
      ])
      .help('h')
      .alias('h', 'help');

    const params = await yargv.parse();
    this.startApp(params, container).catch((error) => console.error(error));
  }
}
