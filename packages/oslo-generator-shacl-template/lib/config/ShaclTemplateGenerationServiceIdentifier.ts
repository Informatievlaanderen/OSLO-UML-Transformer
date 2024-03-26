import { ServiceIdentifier } from "@oslo-flanders/core";

export class ShaclTemplateGenerationServiceIdentifier extends ServiceIdentifier {
  public static readonly PipelineService = Symbol.for('PipelineService');
  public static readonly OutputHandlerService = Symbol.for('OutputHandlerService');
  public static readonly Pipeline = Symbol.for('Pipeline');
  public static readonly ShaclHandler = Symbol.for('ShaclHandler');
  public static readonly TranslationService = Symbol.for('TranslationService');
}