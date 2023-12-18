import { Logger } from "@oslo-flanders/core";
import { DataRegistry, EaConnector, NormalizedConnector } from "@oslo-flanders/ea-uml-extractor";

export interface IConnectorNormalisationCase {
    logger: Logger;
    normalise: (connector: EaConnector, dataRegistry: DataRegistry) => Promise<NormalizedConnector[]>;
}