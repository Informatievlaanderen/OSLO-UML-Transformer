import { Logger } from '@oslo-flanders/core';
import type {
  EaConnector,
  DataRegistry,
  EaElement,
  EaTag,
} from '@oslo-flanders/ea-uml-extractor';
import {
  NormalizedConnector,
} from '@oslo-flanders/ea-uml-extractor';
import { inject, injectable } from 'inversify';
import { EaUmlConverterServiceIdentifier } from '../config/EaUmlConverterServiceIdentifier';
import { TagNames } from '@oslo-converter-uml-ea/enums/TagNames';
import type { IConnectorNormalisationCase } from '@oslo-converter-uml-ea/interfaces/IConnectorNormalisationCase';
import { getTagValue, toCamelCase, toPascalCase, updateNameTag } from '@oslo-converter-uml-ea/utils/utils';

@injectable()
export class AssociationWithNameConnectorCase implements IConnectorNormalisationCase {
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
    dataRegistry: DataRegistry,
  ): Promise<NormalizedConnector[]> {
    if (
      !connector.name ||
      connector.sourceObjectId === connector.destinationObjectId
    ) {
      return [];
    }

    const addPrefix = Boolean(connector.sourceCardinality && connector.destinationCardinality);

    const getLocalName = (
      targetConnector: EaConnector,
      isSourceCardinality: boolean,
    ): string => {
      let localName: string =
        getTagValue(connector, TagNames.LocalName, null) ?? targetConnector.name;

      if (addPrefix) {
        const domainObjectId: number = isSourceCardinality ?
          targetConnector.destinationObjectId :
          targetConnector.sourceObjectId;
        const domainObject: EaElement | undefined = dataRegistry.elements.find(
          x => domainObjectId === x.id,
        );

        if (!domainObject) {
          throw new Error(`
            Unable to find the ${isSourceCardinality ? 'source' : 'destination'} object for connector with path ${targetConnector.path}.
          `);
        }

        const domainObjectName: string =
          getTagValue(domainObject, TagNames.LocalName, null) ??
          domainObject.name;

        localName = `${toPascalCase(domainObjectName)}.${toCamelCase(
          localName,
        )}`;
      }

      return localName;
    };

    const normalisedConnectors: NormalizedConnector[] = [];

    if (connector.sourceCardinality) {
      const localName: string = getLocalName(connector, true);
      const tags: EaTag[] = structuredClone(connector.tags);

      // The name tag is updated or added with the new local name
      updateNameTag(tags, localName);

      normalisedConnectors.push(
        new NormalizedConnector(
          connector,
          connector.name,
          connector.destinationObjectId,
          connector.sourceObjectId,
          connector.sourceCardinality,
          tags,
        ),
      );
    }

    if (connector.destinationCardinality) {
      const localName: string = getLocalName(connector, false);
      const tags: EaTag[] = structuredClone(connector.tags);

      // The name tag is updated or added with the new local name
      updateNameTag(tags, localName);

      normalisedConnectors.push(
        new NormalizedConnector(
          connector,
          connector.name,
          connector.sourceObjectId,
          connector.destinationObjectId,
          connector.destinationCardinality,
          tags,
        ),
      );
    }

    return normalisedConnectors;
  }
}
