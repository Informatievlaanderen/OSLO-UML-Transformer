import {
  DataRegistry,
  EaConnector,
  EaTag,
  NormalizedConnector,
} from '@oslo-flanders/ea-uml-extractor';
import { IConnectorNormalisationCase } from './interfaces/IConnectorNormalisationCase';
import { EaUmlConverterServiceIdentifier } from './config/EaUmlConverterServiceIdentifier';
import { inject, injectable } from 'inversify';
import { container } from './config/DependencyInjectionConfig';

@injectable()
export class ConnectorNormalisationService {
  private readonly caseHandlers: IConnectorNormalisationCase[];

  public constructor() {
    this.caseHandlers = container.getAll<IConnectorNormalisationCase>(
      EaUmlConverterServiceIdentifier.ConnectorNormalisationCase
    );
  }

  public async normalise(
    object: EaConnector,
    model: DataRegistry
  ): Promise<NormalizedConnector[]> {
    const tasks: Promise<NormalizedConnector[]>[] = [];

    this.caseHandlers.forEach((x) => tasks.push(x.normalise(object, model)));
    const normalisedConnectors = (await Promise.all(tasks)).flat(2);

    return normalisedConnectors;
  }

  /**
   * Case: the connector contains information on its "source" end
   * @param object The connector to normalise
   * @param normalised The array to add a normalised connector to
   *
   * If there is a name on the source end (source role), then we use
   * that name and the tags defined on the connector source.
   * Else, we expect the connector to have a name, because it will be used
   * to construct a name for the connector source. The tags set on the association will be used.
   */
  public connectorSourceNormalisation(
    object: EaConnector,
    model: DataRegistry,
    normalised: NormalizedConnector[]
  ): void {
    if (object.sourceCardinality === null) {
      return;
    }

    let name: string;
    let tags: EaTag[];
    if (object.sourceRole && object.sourceRole !== '') {
      name = object.sourceRole;
      tags = object.sourceRoleTags;
    } else {
      const sourceElementName = model.elements.find(
        (x) => x.id === object.sourceObjectId
      );

      if (!object.name || object.name === '') {
        throw new Error(
          `[${this.constructor.name}]: Trying to use the name of the connector to construct for the connector source, but no name was set. Path: ${object.path}.`
        );
      }

      name = `${sourceElementName}.${object.name}`;
      tags = object.tags;
    }

    normalised.push(
      new NormalizedConnector(
        object,
        name,
        object.destinationObjectId,
        object.sourceObjectId,
        object.sourceCardinality,
        tags
      )
    );
  }

  /**
   * Case: the connector contains information on its "target" end
   * @param object The connector to normalise
   * @param normalised The array to add a normalised connector to
   *
   * If there is a name on the target end (destination role), then we use
   * that name and the tags defined on the connector target.
   * Else, we expect the connector to have a name, because it will be used
   * to construct a name for the connector target. The tags set on the association will be used.
   */
  public connectorTargetNormalisation(
    object: EaConnector,
    model: DataRegistry,
    normalised: NormalizedConnector[]
  ): void {
    if (object.destinationCardinality === null) {
      return;
    }

    let name: string;
    let tags: EaTag[];
    if (object.destinationRole && object.destinationRole !== '') {
      name = object.destinationRole;
      tags = object.destinationRoleTags;
    } else {
      const destinationElementName = model.elements.find(
        (x) => x.id === object.destinationObjectId
      );

      if (!object.name || object.name === '') {
        throw new Error(
          `[${this.constructor.name}]: Trying to use the name of the connector to construct for the connector destination, but no name was set. Path: ${object.path}.`
        );
      }

      name = `${destinationElementName}.${object.name}`;
      tags = object.tags;
    }

    normalised.push(
      new NormalizedConnector(
        object,
        name,
        object.sourceObjectId,
        object.destinationObjectId,
        object.destinationCardinality,
        tags
      )
    );
  }

  public connectorAssociationNormalisation(
    object: EaConnector,
    model: DataRegistry,
    normalised: NormalizedConnector[]
  ): void {}
}
