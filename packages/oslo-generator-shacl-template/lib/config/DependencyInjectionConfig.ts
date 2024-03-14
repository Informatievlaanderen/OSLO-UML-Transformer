import type { IService, IConfiguration } from "@oslo-flanders/core";
import { QuadStore, ServiceIdentifier } from "@oslo-flanders/core";
import { Container } from "inversify";
import { ShaclTemplateGenerationServiceConfiguration }
  from "@oslo-generator-shacl-template/config/ShaclTemplateGenerationServiceConfiguration";
import { ShaclTemplateGenerationService } from "@oslo-generator-shacl-template/ShaclTemplateGenerationService";

export const container = new Container();

container.bind<IService>(ServiceIdentifier.Service)
  .to(ShaclTemplateGenerationService)
  .inSingletonScope();

container.bind<IConfiguration>(ServiceIdentifier.Configuration)
  .to(ShaclTemplateGenerationServiceConfiguration)
  .inSingletonScope();

container.bind<QuadStore>(ServiceIdentifier.QuadStore)
  .to(QuadStore);