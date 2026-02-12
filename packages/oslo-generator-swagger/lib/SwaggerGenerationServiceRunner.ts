import type { CliArgv } from '@oslo-flanders/core';
import { AppRunner } from '@oslo-flanders/core';

import type { SwaggerGenerationService } from '../lib/SwaggerGenerationService';
import { container } from './config/DependencyInjectionConfig';
import type { SwaggerGenerationServiceConfiguration } from './config/SwaggerGenerationServiceConfiguration';

export class SwaggerGenerationServiceRunner extends AppRunner<
  SwaggerGenerationService,
  SwaggerGenerationServiceConfiguration
> {
  public async runCli(argv: CliArgv): Promise<void> {
    const yargv = this.createYargsInstance(argv.slice(2))
      .option('input', {
        describe:
          'The input file to generate a Swagger OpenAPI JSON file from.',
        default: 'input.jsonld',
      })
      .option('output', {
        describe: 'Name of the output file.',
        default: 'openapi.json',
      })
      .option('versionSwagger', {
        describe: 'Version of the Swagger specification used for generation.',
      })
      .option('versionAPI', { describe: 'API version.' })
      .option('language', { describe: 'API language tag.', default: 'nl' })
      .option('title', {
        describe: 'API title.',
        type: 'string',
        array: false,
      })
      .option('description', { describe: 'API description.', array: false })
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
        'versionSwagger',
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
