import { IConfiguration, IService, QuadStore, ServiceIdentifier } from "@oslo-flanders/core";
import { Container } from "inversify";
import { HtmlRespecGenerationService, HtmlRespecGenerationServiceConfiguration } from "../../../oslo-generator-respec-html";

export const container = new Container();

container
  .bind<IService>(ServiceIdentifier.Service)
  .to(HtmlRespecGenerationService)
  .inSingletonScope();

container
  .bind<IConfiguration>(ServiceIdentifier.Configuration)
  .to(HtmlRespecGenerationServiceConfiguration)
  .inSingletonScope();

container.bind<QuadStore>(ServiceIdentifier.QuadStore).to(QuadStore);
