import { IConversionService, IOutputHandler } from "@oslo-flanders/core";
import { inject, injectable } from "inversify";
import { DataRegistry } from "@oslo-flanders/ea-uml-extractor";
import { EaUmlConverterConfiguration } from "./config/EaUmlConverterConfiguration";
import { UriRegistry } from "./UriRegistry";
import { ConverterHandlerService } from "./ConverterHandlerService";
import { EaUmlConverterServiceIdentifier } from "./config/EaUmlConverterServiceIdentifier";

@injectable()
export class EaUmlConversionService implements IConversionService {
  public readonly configuration: EaUmlConverterConfiguration;
  public readonly outputHandler: IOutputHandler;

  public constructor(
    @inject(EaUmlConverterServiceIdentifier.Configuration) config: EaUmlConverterConfiguration,
    @inject(EaUmlConverterServiceIdentifier.OutputHandler) outputHandler: IOutputHandler
  ) {
    this.configuration = config;
    this.outputHandler = outputHandler;
  }

  public async run(): Promise<void> {
    const model = new DataRegistry();
    const converterHandler = new ConverterHandlerService();
    const uriRegistry = new UriRegistry();

    await model.extract(this.configuration.umlFile);

    const store = await converterHandler.normalize(model)
      .then(() => converterHandler.assignUris(model, uriRegistry))
      .then(() => converterHandler.convert(model, uriRegistry));

    await this.outputHandler.write(store);
  }
}