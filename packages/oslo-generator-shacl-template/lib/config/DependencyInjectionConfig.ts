import type { IService, IConfiguration } from "@oslo-flanders/core";
import { QuadStore } from "@oslo-flanders/core";
import { Container } from "inversify";
import { OutputHandlerService } from "../OutputHandlerService";
import { PipelineService } from "../PipelineService";
import { ShaclTemplateGenerationService } from "../ShaclTemplateGenerationService";
import { TranslationService } from "../TranslationService";
import { ShaclHandler } from "../types/IHandler";
import { Pipeline } from "../types/Pipeline";
import { ShaclTemplateGenerationServiceConfiguration }
  from "./ShaclTemplateGenerationServiceConfiguration";
import { ShaclTemplateGenerationServiceIdentifier } from
  "./ShaclTemplateGenerationServiceIdentifier";

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