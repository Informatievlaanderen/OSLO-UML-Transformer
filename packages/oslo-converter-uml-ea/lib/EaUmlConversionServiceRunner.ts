import type { CliArgv } from '@oslo-flanders/core';
import { LOG_LEVELS, AppRunner, OutputFormat } from '@oslo-flanders/core';

import { InputFormat } from '@oslo-flanders/core/lib/enums/InputFormat';
import { container } from './config/DependencyInjectionConfig';
import type { EaUmlConverterConfiguration } from './config/EaUmlConverterConfiguration';
import type { EaUmlConversionService } from './EaUmlConversionService';

export class EaUmlConversionServiceRunner extends AppRunner<
  EaUmlConversionService,
  EaUmlConverterConfiguration
> {
  public async runCli(argv: CliArgv): Promise<void> {
    const yargv = this.createYargsInstance(argv.slice(2))
      .option('umlFile', { describe: 'URL or local path to an EAP file.' })
      .option('diagramName', {
        describe: 'Name of the diagram within the EAP file.',
      })
      .option('outputFile', {
        describe: 'Name of the output file (default: console).',
      })
      .option('versionId', {
        describe: 'Relative URI used to identify this document.',
      })
      .option('outputFormat', {
        describe:
          'RDF content-type in which the output must be written or to the console.',
        choices: [OutputFormat.JsonLd, OutputFormat.trig],
        default: OutputFormat.JsonLd,
      })
      .option('publicationEnvironment', {
        describe:
          'The base URI of environment where the document will be published',
      })
      .option('silent', {
        describe: 'All logs are suppressed',
        default: false,
        boolean: true,
      })
      .option('logLevel', {
        describe: 'Log only if level is less than or equal to this level',
        default: 'info',
        choices: LOG_LEVELS,
      })
      .option('allTags', {
        describe: 'Add all tags from EA to the generated output',
        default: false,
        boolean: true,
      })
      .option('debug', {
        describe:
          'A flag to enable debug mode which is more resilient to errors',
        default: false,
        boolean: true,
      })
      .option('inputFormat', {
        describe: 'The format of the input file',
        default: InputFormat.AccessDB,
        choices: [InputFormat.AccessDB, InputFormat.SQLite],
      })
      .demandOption(
        ['umlFile', 'diagramName', 'versionId', 'publicationEnvironment'],
        'Please provide the necessary arguments to work with this tool.',
      )
      .help('h')
      .alias('h', 'help');

    const params = await yargv.parse();
    this.startApp(params, container).catch((error) => console.error(error));
  }
}
