import {
  EaConnector,
  DataRegistry,
  NormalizedConnector,
  EaObject,
  EaTag,
} from '@oslo-flanders/ea-uml-extractor';
import { IConnectorNormalisationCase } from '../interfaces/IConnectorNormalisationCase';
import { inject, injectable } from 'inversify';
import { TagNames } from '../enums/TagNames';
import {
  getTagValue,
  toCamelCase,
  toPascalCase,
  updateNameTag,
} from '../utils/utils';
import { Logger } from '@oslo-flanders/core';
import { EaUmlConverterServiceIdentifier } from '../config/EaUmlConverterServiceIdentifier';

@injectable()
export class SelfAssociationWithNameConnectorCase
  implements IConnectorNormalisationCase
{
  @inject(EaUmlConverterServiceIdentifier.Logger)
  public readonly logger!: Logger;

  /**
   * Case: the connector is a self-association with a name and a source and/or destination cardinality
   * @param connector The connector to normalise
   * @param dataRegistry The registry to use to extract relevant information from other elements
   * @returns An array of normalised connectors
   */
  public async normalise(
    connector: EaConnector,
    dataRegistry: DataRegistry
  ): Promise<NormalizedConnector[]> {
    if (
      connector.name === null ||
      connector.sourceObjectId !== connector.destinationObjectId
    ) {
      return [];
    }

    const disambiguate =
      connector.sourceCardinality !== null &&
      connector.destinationCardinality !== null;

    const normalisedConnectors: NormalizedConnector[] = [];

    const createNormalisedConnector = (
      connector: EaConnector,
      role: 'target' | 'source'
    ): NormalizedConnector => {
      const cardinality =
        role === 'target'
          ? connector.sourceCardinality
          : connector.destinationCardinality;
      const domainObject = dataRegistry.elements.find(
        (x) => x.id === connector.sourceObjectId
      );

      if (!domainObject) {
        throw new Error(
          `Unable to find the ${role} object for connector with path ${connector.path}.`
        );
      }

      const domainObjectName =
        getTagValue(domainObject, TagNames.LocalName, null) ??
        domainObject.name;
      const connectorName =
        getTagValue(connector, TagNames.LocalName, null) ?? connector.name;
      const localName = `${toPascalCase(domainObjectName)}.${toCamelCase(
        connectorName
      )}.${role}`;
      let tags = structuredClone(connector.tags);

      // Change or update the value of the 'name' tag as with the new local name
      updateNameTag(tags, localName);

      return new NormalizedConnector(
        connector,
        `${connector.name} (${role})`,
        connector.sourceObjectId,
        connector.destinationObjectId,
        cardinality,
        tags
      );
    };

    if (disambiguate) {
      normalisedConnectors.push(
        createNormalisedConnector(connector, 'target'),
        createNormalisedConnector(connector, 'source')
      );
    } else {
      const connectorName =
        getTagValue(connector, TagNames.LocalName, null) ?? connector.name;
      const localName = toCamelCase(connectorName);
      const hasSourceCardinality = connector.sourceCardinality !== null;

      const tags = updateNameTag(structuredClone(connector.tags), localName);

      normalisedConnectors.push(
        new NormalizedConnector(
          connector,
          connector.name,
          hasSourceCardinality
            ? connector.destinationObjectId
            : connector.sourceObjectId,
          hasSourceCardinality
            ? connector.sourceObjectId
            : connector.destinationObjectId,
          connector.sourceCardinality ?? connector.destinationCardinality,
          tags
        )
      );
    }

    return normalisedConnectors;
  }
}
