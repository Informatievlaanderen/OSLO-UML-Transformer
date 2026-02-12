import type { CliArgv } from '@oslo-flanders/core';
import { AppRunner } from '@oslo-flanders/core';
import { container } from './config/DependencyInjectionConfig';
import type { 
  JsonWebuniversumGenerationServiceConfiguration,
 } from './config/JsonWebuniversumGenerationServiceConfiguration';
import { IgnoredUris } from './constants/IgnoredUris';
import type { JsonWebuniversumGenerationService } from './JsonWebuniversumGenerationService';

export class JsonWebuniversumGenerationServiceRunner extends AppRunner<
  JsonWebuniversumGenerationService,
  JsonWebuniversumGenerationServiceConfiguration
> {
  public async runCli(argv: CliArgv): Promise<void> {
    const yargv = this.createYargsInstance(argv.slice(2))
      .option('input', {
        describe: 'The input file to generate a Webuniversum config from.',
      })
      .option('output', {
        describe: 'Name of the output file.',
        default: 'webuniversum-config.json',
      })
      .option('language', {
        describe: 'The language in which the config must be generated.',
      })
      .option('silent', {
        describe: 'All logs are suppressed',
        default: false,
        boolean: true,
      })
      .option('applyFiltering', {
        describe: `Wether or not to apply filters on the generated output. The filters limit the generated classes, datatypes, 
        entities and properties that will be shown. If you just want all possible values, you can set the value to false.`,
        default: true,
        boolean: true,
      })
      .option('specificationType', {
        describe:
          'The specification type to generate the webuniversum config for',
        choices: ['ApplicationProfile', 'Vocabulary'],
        default: 'Vocabulary',
      })
      .option('inheritance', {
        describe: 'Add all properties from the superclass to the child class',
        default: false,
        boolean: true,
      })
      .option('publicationEnvironment', {
        describe:
          'The base URI of environment where the document will be published',
      })
      .option('allTags', {
        describe: `Whether or not to make a selection of key values for the generated classes, datatypes entities and properties.`,
        default: false,
        boolean: true,
      })
      .option('ignoreSkosConcept', {
        describe: `Ignore elements with SKOS Concept URI (${IgnoredUris.SKOS_CONCEPT})`,
        default: false,
        boolean: true,
      })
      .demandOption(['input', 'language', 'publicationEnvironment'])
      .help('h')
      .alias('h', 'help');

    const params = await yargv.parse();
    this.startApp(params, container).catch((error) => console.error(error));
  }
}
