import { ShaclTemplateGenerationServiceConfiguration } from "./config/ShaclTemplateGenerationServiceConfiguration";
import { ClassShapeBaseHandler } from "./handlers/ClassShapeBaseHandler";
import type * as RDF from '@rdfjs/types'
import type { IHandler, NamedOrBlankNode, ShaclHandler } from "./types/IHandler";
import { PropertyShapeBaseHandler } from "./handlers/PropertyShapeBaseHandler";
import { inject, injectable } from "inversify";
import { ShaclTemplateGenerationServiceIdentifier } from "./config/ShaclTemplateGenerationServiceIdentifier";
import { Pipeline } from "./types/Pipeline";
import { Logger } from "@oslo-flanders/core";
import { Constraint } from "./enums/Constraint";
import { NodeKindConstraintHandler } from "./handlers/NodeKindConstraintHandler";
import { UniqueLanguageConstraintHandler } from "./handlers/UniqueLanguageConstraintHandler";
import { CodelistConstraintHandler } from "./handlers/CodelistConstraintHandler";
import { container } from "./config/DependencyInjectionConfig";
import { TranslationService } from "./TranslationService";
import { CardinalityConstraintHandler } from "./handlers/CardinalityConstraintHandler";

@injectable()
export class PipelineService {
  private _classPipeline: Pipeline | undefined
  private _propertyPipeline: Pipeline | undefined;
  private readonly logger: Logger;

  public constructor(
    @inject(ShaclTemplateGenerationServiceIdentifier.Configuration) config: ShaclTemplateGenerationServiceConfiguration,
    @inject(ShaclTemplateGenerationServiceIdentifier.Logger) logger: Logger,
  ) {
    this.logger = logger;
  }

  public createPipelines(config: ShaclTemplateGenerationServiceConfiguration): void {
    const translationService: TranslationService = container.get<TranslationService>(ShaclTemplateGenerationServiceIdentifier.TranslationService);

    this._classPipeline = new Pipeline();
    this._classPipeline.addComponent(new ClassShapeBaseHandler(config, this.logger, translationService));

    this._propertyPipeline = new Pipeline();
    this._propertyPipeline.addComponent(new PropertyShapeBaseHandler(config, this.logger, translationService));
    this._propertyPipeline.addComponent(new CardinalityConstraintHandler(config, this.logger, translationService));

    if (config.constraint.includes(Constraint.NodeKind)) {
      
      this._propertyPipeline.addComponent(new NodeKindConstraintHandler(config, this.logger, translationService));
    }

    if (config.constraint.includes(Constraint.UniqueLanguage)) {
      this._propertyPipeline.addComponent(new UniqueLanguageConstraintHandler(config, this.logger, translationService));
    }

    if (config.constraint.includes(Constraint.Codelist)) {
      this._propertyPipeline.addComponent(new CodelistConstraintHandler(config, this.logger, translationService));
    }
  }

  public loadSubjectIdToShapeIdMaps(
    classSubjectIdToShapeIdMap: Map<string, NamedOrBlankNode>,
    propertySubjectIdToShapeIdMap: Map<string, NamedOrBlankNode>,
  ): void {
    this.classPipeline.loadSubjectIdToShapeIdMaps(classSubjectIdToShapeIdMap, propertySubjectIdToShapeIdMap);
    this.propertyPipeline.loadSubjectIdToShapeIdMaps(classSubjectIdToShapeIdMap, propertySubjectIdToShapeIdMap);
  }

  public get classPipeline(): Pipeline {
    if (!this._classPipeline) {
      throw new Error('Trying to access "classPipeline" before it is set.');
    }
    return this._classPipeline;
  }

  public get propertyPipeline(): Pipeline {
    if (!this._propertyPipeline) {
      throw new Error('Trying to access "propertyPipeline" before it is set.');
    }
    return this._propertyPipeline;
  }

}