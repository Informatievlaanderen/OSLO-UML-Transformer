import type { Logger } from '@oslo-flanders/core';
import type { DataRegistry, EaConnector, NormalizedConnector } from '@oslo-flanders/ea-uml-extractor';

export interface IConnectorNormalisationCase {
  logger: Logger;
  normalise: (connector: EaConnector, dataRegistry: DataRegistry) => Promise<NormalizedConnector[]>;
}
