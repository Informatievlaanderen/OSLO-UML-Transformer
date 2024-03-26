import type { IService, IConfiguration } from "@oslo-flanders/core";
import { QuadStore } from "@oslo-flanders/core";
import { Container } from "inversify";
import { ShaclTemplateGenerationServiceConfiguration }
  from "@oslo-generator-shacl-template/config/ShaclTemplateGenerationServiceConfiguration";
import { ShaclTemplateGenerationServiceIdentifier } from
  "@oslo-generator-shacl-template/config/ShaclTemplateGenerationServiceIdentifier";
import { OutputHandlerService } from "@oslo-generator-shacl-template/OutputHandlerService";
import { PipelineService } from "@oslo-generator-shacl-template/PipelineService";
import { ShaclTemplateGenerationService } from "@oslo-generator-shacl-template/ShaclTemplateGenerationService";
import { TranslationService } from "@oslo-generator-shacl-template/TranslationService";
import { ShaclHandler } from "@oslo-generator-shacl-template/types/IHandler";
import { Pipeline } from "@oslo-generator-shacl-template/types/Pipeline";

export const container = new Container();

container.bind<IService>(ShaclTemplateGenerationServiceIdentifier.Service)
  .to(ShaclTemplateGenerationService)
  .inSingletonScope();

container.bind<IConfiguration>(ShaclTemplateGenerationServiceIdentifier.Configuration)
  .to(ShaclTemplateGenerationServiceConfiguration)
  .inSingletonScope();

container.bind<QuadStore>(ShaclTemplateGenerationServiceIdentifier.QuadStore)
  .to(QuadStore);

container.bind<PipelineService>(ShaclTemplateGenerationServiceIdentifier.PipelineService)
  .to(PipelineService)
  .inSingletonScope();

container.bind<OutputHandlerService>(ShaclTemplateGenerationServiceIdentifier.OutputHandlerService)
  .to(OutputHandlerService)
  .inSingletonScope();

container.bind<Pipeline>(ShaclTemplateGenerationServiceIdentifier.Pipeline)
  .to(Pipeline);

container.bind<ShaclHandler>(ShaclTemplateGenerationServiceIdentifier.ShaclHandler)
  .to(ShaclHandler)

container.bind<TranslationService>(ShaclTemplateGenerationServiceIdentifier.TranslationService)
  .to(TranslationService)
  .inSingletonScope();