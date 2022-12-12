import type { CliArgv } from '@oslo-flanders/core';
import { AppRunner } from '@oslo-flanders/core';
import yargs from 'yargs';
import { container } from './config/DependencyInjectionConfig';
import type { EaUmlConverterConfiguration } from './config/EaUmlConverterConfiguration';
import { EaUmlConverterServiceIdentifier } from './config/EaUmlConverterServiceIdentifier';
import type { EaUmlConversionService } from './EaUmlConversionService';

export class EaUmlConversionServiceRunner extends AppRunner {
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
      .option('versionId', { describe: 'Version identifier for the document.' })
      .option('baseUri', { describe: 'The base URI to be used within the document and to create the version URI.' })
      .option('outputFormat',
        {
          describe: 'RDF content-type in which the output must be written or to the console.',
          choices: ['application/ld+json', 'application/trig'],
        })
      .demandOption(['umlFile', 'diagramName', 'specificationType', 'versionId', 'baseUri'],
        'Please provide the necessary arguments to work with this tool.')
      .help('h')
      .alias('h', 'help');

    const params = await yargv.parse();
    const configuration = container.get<EaUmlConverterConfiguration>(EaUmlConverterServiceIdentifier.Configuration);
    await configuration.createFromCli(params);

    const conversionService = container.get<EaUmlConversionService>(EaUmlConverterServiceIdentifier.ConversionService);
    conversionService.run().catch(error => console.error(error));
  }
}
