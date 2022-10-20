import { AppRunner, CliArgv } from "@oslo-flanders/core";
import yargs from "yargs";
import { container } from "./config/DependencyInjectionConfig";
import { EaUmlConverterConfiguration } from "./config/EaUmlConverterConfiguration";
import { ServiceIdentifier } from "./config/ServiceIdentifier";
import { EaUmlConversionService } from "./EaUmlConversionService";

export class EaUmlConversionServiceRunner extends AppRunner {
  public async runCli(argv: CliArgv): Promise<void> {
    // TODO: implement CLI part
    const yargv = yargs(argv.slice(2))
      .usage('node ./bin/runner.js [args]')
      .help('h')
      .alias('h', 'help');

    const params = await yargv.parse();

    const configuration = container.get<EaUmlConverterConfiguration>(ServiceIdentifier.UmlConverterConfiguration);
    configuration.createFromCli(params)

    const conversionService = container.get<EaUmlConversionService>(ServiceIdentifier.ConversionService);
    conversionService.run().catch(error => console.error(error));
  }

}