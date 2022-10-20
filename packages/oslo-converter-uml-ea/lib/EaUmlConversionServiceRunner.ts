import { AppRunner, CliArgv, IOutputHandler } from "@oslo-flanders/core";
import yargs from "yargs";
import { ConsoleOutputHandler, RdfOutputHandler } from "@oslo-flanders/output-handlers";
import { container } from "./config/DependencyInjectionConfig";
import { EaUmlConverterConfiguration } from "./config/EaUmlConverterConfiguration";
import { EaUmlConverterServiceIdentifier } from "./config/EaUmlConverterServiceIdentifier";
import { EaUmlConversionService } from "./EaUmlConversionService";

export class EaUmlConversionServiceRunner extends AppRunner {
  public async runCli(argv: CliArgv): Promise<void> {
    const yargv = yargs(argv.slice(2))
      .usage('node ./bin/runner.js [args]')
      .option('umlFile', { describe: 'URL or local path to an EAP file.' })
      .option('diagramName', { describe: 'Name of the diagram within the EAP file.' })
      .option('outputFile', { describe: 'Name of the output file. Default "report.jsonld".' })
      .option('specificationType', { describe: 'Type of the specification: "ApplicationProfile" or "Vocabulary".' })
      .option('versionId', { describe: 'Version identifier for the document.' })
      .option('baseUri', { describe: 'The base URI to be used within the document and to create the version URI.' })
      .option('outputFormat', { describe: 'RDF content-type in which the output must be written. Default: console' })
      .demandOption(['umlFile', 'diagramName', 'specificationType', 'versionId', 'baseUri'], 'Please provide the necessary arguments to work with this tool.')
      .help('h')
      .alias('h', 'help');

    const params = await yargv.parse();
    const configuration = container.get<EaUmlConverterConfiguration>(EaUmlConverterServiceIdentifier.Configuration);
    await configuration.createFromCli(params);

    if (params.outputFormat) {
      container.bind<IOutputHandler>(EaUmlConverterServiceIdentifier.OutputHandler).to(RdfOutputHandler);
    } else {
      container.bind<IOutputHandler>(EaUmlConverterServiceIdentifier.OutputHandler).to(ConsoleOutputHandler);
    }

    const conversionService = container.get<EaUmlConversionService>(EaUmlConverterServiceIdentifier.ConversionService);
    conversionService.run().catch(error => console.error(error));
  }

}