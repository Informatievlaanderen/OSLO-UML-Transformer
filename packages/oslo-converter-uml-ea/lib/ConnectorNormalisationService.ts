import type {
  DataRegistry,
  EaConnector,
  NormalizedConnector,
} from '@oslo-flanders/ea-uml-extractor';

import { injectable } from 'inversify';
import { container } from '@oslo-converter-uml-ea/config/DependencyInjectionConfig';
import { EaUmlConverterServiceIdentifier } from '@oslo-converter-uml-ea/config/EaUmlConverterServiceIdentifier';
import type { IConnectorNormalisationCase } from '@oslo-converter-uml-ea/interfaces/IConnectorNormalisationCase';

@injectable()
export class ConnectorNormalisationService {
  private readonly caseHandlers: IConnectorNormalisationCase[];

  public constructor() {
    this.caseHandlers = container.getAll<IConnectorNormalisationCase>(
      EaUmlConverterServiceIdentifier.ConnectorNormalisationCase,
    );
  }

  public async normalise(
    object: EaConnector,
    model: DataRegistry,
  ): Promise<NormalizedConnector[]> {
    const tasks: Promise<NormalizedConnector[]>[] =
      this.caseHandlers.map((x: IConnectorNormalisationCase) => x.normalise(object, model));

    const normalisedConnectors = (await Promise.all(tasks)).flat(2);

    return normalisedConnectors;
  }
}
