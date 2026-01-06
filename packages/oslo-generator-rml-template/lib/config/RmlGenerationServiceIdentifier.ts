import { ServiceIdentifier } from "@oslo-flanders/core";

export class RmlGenerationServiceIdentifier extends ServiceIdentifier {
  public static readonly OutputHandlerService = Symbol.for('OutputHandlerService');
}
