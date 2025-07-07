import type { CliArgv } from '@oslo-flanders/core';
import { AppRunner, OutputFormat } from '@oslo-flanders/core';
import yargs from 'yargs';
import { container } from './config/DependencyInjectionConfig';
import type { ShaclTemplateGenerationServiceConfiguration } from './config/ShaclTemplateGenerationServiceConfiguration';
import type { ShaclTemplateGenerationService } from './ShaclTemplateGenerationService';

export class ShaclTemplateGenerationServiceRunner extends AppRunner<
  ShaclTemplateGenerationService,
  ShaclTemplateGenerationServiceConfiguration
> {
  public async runCli(argv: CliArgv): Promise<void> {
    const yargv = yargs(argv.slice(2))
      .usage('node ./bin/runner.js [args]')
      .option('input', {
        describe: 'The input file to generate a SHACL template from.',
      })
      .option('output', {
        describe:
          'Name of the output file. By default, a file in the chosen output format will be created',
        default: '',
      })
      .option('outputFormat', {
        describe: 'The format of the output file.',
        default: OutputFormat.JsonLd,
        choices: [
          OutputFormat.JsonLd,
          OutputFormat.turtle,
          OutputFormat.ntriples,
        ],
      })
      .option('language', {
        describe: 'The language in which the SHACL template must be generated.',
      })
      .option('shapeBaseURI', {
        describe:
          'The base URI to be used for the HTTP URIs of the SHACL shapes.',
        default: 'http://example.org#',
      })
      .option('mode', {
        describe:
          "The generation mode, which can be 'grouped' or 'individual'.",
        default: 'grouped',
        choices: ['grouped', 'individual'],
      })
      .option('constraint', {
        describe: 'Additional constraints to add to the SHACL shape.',
        type: 'array',
        default: [],
        choices: ['uniqueLanguages', 'nodeKind', 'codelist'],
      })
      .option('applicationProfileURL', {
        describe: `The URL on which the application profile is published. 
        This is needed to create references to terms on the application profile.`,
        default: '',
      })
      .option('useUniqueURIs', {
        describe:
          'Create unique HTTP URIs for the individual constraint using the labels',
        default: false,
        boolean: true,
      })
      .option('addConstraintMessages', {
        describe:
          'Add additional messages in the configured language to the SHACL shapes',
        default: false,
        boolean: true,
      })
      .option('addRuleNumbers', {
        describe:
          'Add extra entry for rule numbers, allowing editors to add a rule number across multiple specs.',
        default: false,
        boolean: true,
      })
      .option('addShapesContainer', {
        describe:
          'Creates a container shape that links to all generated shapes using rdfs:member properties',
        type: 'boolean',
        default: true,
      })
      .option('silent', {
        describe: 'All logs are suppressed',
        default: false,
        boolean: true,
      })
      .demandOption(['input', 'language'])
      .help('h')
      .alias('h', 'help');

    const params = await yargv.parse();
    this.startApp(params, container).catch((error) => console.error(error));
  }
}
