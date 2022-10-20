import { ServiceIdentifier } from "@oslo-flanders/core";

export class EaUmlConverterServiceIdentifier extends ServiceIdentifier {
  static readonly ConverterHandler = Symbol.for('ConverterHandler')
}