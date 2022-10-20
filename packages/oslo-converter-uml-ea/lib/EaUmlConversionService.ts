import { IConversionService, IOutputHandler } from "@oslo-flanders/core";
import { inject, injectable } from "inversify";
import { DataRegistry } from "@oslo-flanders/ea-uml-extractor";
import { ServiceIdentifier } from "./config/ServiceIdentifier";
import { EaUmlConverterConfiguration } from "./config/EaUmlConverterConfiguration";
import { OsloUriRegistry } from "./UriRegistry";
import { ConverterHandlerService } from "./ConverterHandlerService";

@injectable()
export class EaUmlConversionService implements IConversionService {
  public readonly configuration: EaUmlConverterConfiguration;
  public readonly outputHandler: IOutputHandler;

  public constructor(
    @inject(ServiceIdentifier.UmlConverterConfiguration) config: EaUmlConverterConfiguration,
    @inject(ServiceIdentifier.OutputHandler) outputHandler: IOutputHandler
  ) {
    this.configuration = config;
    this.outputHandler = outputHandler;
    console.log(config);
  }

  public async run(): Promise<void> {
    const model = new DataRegistry();
    const converterHandler = new ConverterHandlerService();
    const uriRegistry = new OsloUriRegistry();

    await model.extract(this.configuration.umlFile);

    const store = await converterHandler.normalize(model)
      .then(() => converterHandler.assignUris(model, uriRegistry))
      .then(() => converterHandler.convert(model, uriRegistry));

    await this.outputHandler.write(store);
  }
}