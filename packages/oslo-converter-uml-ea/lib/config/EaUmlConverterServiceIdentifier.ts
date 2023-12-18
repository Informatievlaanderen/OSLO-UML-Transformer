import { ServiceIdentifier } from '@oslo-flanders/core';

export class EaUmlConverterServiceIdentifier extends ServiceIdentifier {
  public static readonly ConverterHandler = Symbol.for('ConverterHandler');
  public static readonly OutputHandlerService = Symbol.for('OutputHandlerService');
  public static readonly ConnectorNormalisationService = Symbol.for('ConnectorNormalisationService');
  public static readonly ConnectorNormalisationCase = Symbol.for('ConnectorNormalisationCase');
}
