import {
  EaConnector,
  DataRegistry,
  NormalizedConnector,
  EaTag,
} from '@oslo-flanders/ea-uml-extractor';
import { IConnectorNormalisationCase } from '../interfaces/IConnectorNormalisationCase';
import { inject, injectable } from 'inversify';
import { TagNames } from '../enums/TagNames';
import { getTagValue, toCamelCase, toPascalCase, updateNameTag } from '../utils/utils';
import { Logger } from '@oslo-flanders/core';
import { EaUmlConverterServiceIdentifier } from '../config/EaUmlConverterServiceIdentifier';

@injectable()
export class AssociationWithNameConnectorCase
  implements IConnectorNormalisationCase
{
  @inject(EaUmlConverterServiceIdentifier.Logger)
  public readonly logger!: Logger;

  /**
   * Case: the connector has a name and a source and/or destination cardinality.
   *  This class does not handle the case of a self-association.
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
      connector.sourceObjectId === connector.destinationObjectId
    ) {
      return [];
    }

    const addPrefix =
      connector.sourceCardinality !== null &&
      connector.destinationCardinality !== null;

    const getLocalName = (
      connector: EaConnector,
      isSourceCardinality: boolean
    ): string => {
      let localName =
        getTagValue(connector, TagNames.LocalName, null) ?? connector.name;

      if (addPrefix) {
        const domainObjectId = isSourceCardinality
          ? connector.destinationObjectId
          : connector.sourceObjectId;
        const domainObject = dataRegistry.elements.find(
          (x) => domainObjectId === x.id
        );

        if (!domainObject) {
          throw new Error(`
            Unable to find the ${
              isSourceCardinality ? 'source' : 'destination'
            } object for connector with path ${connector.path}.
          `);
        }

        const domainObjectName =
          getTagValue(domainObject, TagNames.LocalName, null) ??
          domainObject.name;

        localName = `${toPascalCase(domainObjectName)}.${toCamelCase(
          localName
        )}`;
      }

      return localName;
    };

    const normalisedConnectors: NormalizedConnector[] = [];

    if (connector.sourceCardinality !== null) {
      const localName = getLocalName(connector, true);
      const tags = structuredClone(connector.tags);

      // The name tag is updated or added with the new local name
      updateNameTag(tags, localName);

      normalisedConnectors.push(
        new NormalizedConnector(
          connector,
          connector.name,
          connector.destinationObjectId,
          connector.sourceObjectId,
          connector.sourceCardinality,
          tags
        )
      );
    }

    if (connector.destinationCardinality !== null) {
      const localName = getLocalName(connector, false);
      const tags = structuredClone(connector.tags);

      // The name tag is updated or added with the new local name
      updateNameTag(tags, localName);

      normalisedConnectors.push(
        new NormalizedConnector(
          connector,
          connector.name,
          connector.sourceObjectId,
          connector.destinationObjectId,
          connector.destinationCardinality,
          tags
        )
      );
    }

    return normalisedConnectors;
  }
}
