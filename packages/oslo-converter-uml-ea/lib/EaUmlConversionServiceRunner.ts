import type { CliArgv } from '@oslo-flanders/core';
import { LOG_LEVELS, AppRunner } from '@oslo-flanders/core';

import yargs from 'yargs';
import { container } from './config/DependencyInjectionConfig';
import type { EaUmlConverterConfiguration } from './config/EaUmlConverterConfiguration';
import type { EaUmlConversionService } from './EaUmlConversionService';

export class EaUmlConversionServiceRunner extends AppRunner<EaUmlConversionService, EaUmlConverterConfiguration> {
  public async runCli(argv: CliArgv): Promise<void> {
    const yargv = yargs(argv.slice(2))
      .usage('node ./bin/runner.js [args]')
      .option('umlFile', { describe: 'URL or local path to an EAP file.' })
      .option('diagramName', { describe: 'Name of the diagram within the EAP file.' })
      .option('outputFile',
        {
          describe: 'Name of the output file (default: console).',
        })
      .option('specificationType',
        {
          describe: 'Type of the specification.',
          choices: ['ApplicationProfile', 'Vocabulary'],
        })
      .option('versionId', { describe: 'Relative URI used to identify this document.' })
      .option('baseUri', { describe: 'The base URI to be used within the document and to create the version URI.' })
      .option('outputFormat',
        {
          describe: 'RDF content-type in which the output must be written or to the console.',
          choices: ['application/ld+json', 'application/trig'],
          default: 'application/ld+json',
        })
      .option('publicationEnvironment',
        {
          describe: 'The base URI of environment where the document will be published',
        })
      .option('silent',
        {
          describe: 'All logs are suppressed',
          default: false,
          boolean: true,
        })
      .option('logLevel', {
        describe: 'Log only if level is less than or equal to this level',
        default: 'info',
        choices: LOG_LEVELS,
      })
      .demandOption(['umlFile', 'diagramName', 'specificationType', 'versionId', 'baseUri', 'publicationEnvironment'],
        'Please provide the necessary arguments to work with this tool.')
      .help('h')
      .alias('h', 'help');

    const params = await yargv.parse();
    this.startApp(params, container).catch(error => console.error(error));
  }
}
