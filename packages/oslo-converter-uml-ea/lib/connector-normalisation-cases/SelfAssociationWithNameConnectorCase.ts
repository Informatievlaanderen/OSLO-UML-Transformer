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
import {
  getTagValue,
  toCamelCase,
  toPascalCase,
  updateNameTag,
} from '@oslo-converter-uml-ea/utils/utils';

@injectable()
export class SelfAssociationWithNameConnectorCase implements IConnectorNormalisationCase {
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
    dataRegistry: DataRegistry,
  ): Promise<NormalizedConnector[]> {
    if (
      !connector.name ||
      connector.sourceObjectId !== connector.destinationObjectId
    ) {
      return [];
    }

    const disambiguate = Boolean(connector.sourceCardinality && connector.destinationCardinality);
    const normalisedConnectors: NormalizedConnector[] = [];

    const createNormalisedConnector = (
      originalConnector: EaConnector,
      role: 'target' | 'source',
    ): NormalizedConnector => {
      const cardinality: string =
        role === 'target' ?
          originalConnector.sourceCardinality :
          originalConnector.destinationCardinality;

      const domainObject: EaElement | undefined = dataRegistry.elements.find(
        x => x.id === originalConnector.sourceObjectId,
      );

      if (!domainObject) {
        throw new Error(
          `Unable to find the ${role} object for connector with path ${originalConnector.path}.`,
        );
      }

      const domainObjectName: string =
        getTagValue(domainObject, TagNames.LocalName, null) ?? domainObject.name;
      const connectorName: string =
        getTagValue(originalConnector, TagNames.LocalName, null) ?? originalConnector.name;
      const localName = `${toPascalCase(domainObjectName)}.${toCamelCase(connectorName)}.${role}`;
      const tags: EaTag[] = structuredClone(originalConnector.tags);

      // Change or update the value of the 'name' tag as with the new local name
      updateNameTag(tags, localName);

      return new NormalizedConnector(
        originalConnector,
        `${originalConnector.name} (${role})`,
        originalConnector.sourceObjectId,
        originalConnector.destinationObjectId,
        cardinality,
        tags,
      );
    };

    if (disambiguate) {
      normalisedConnectors.push(
        createNormalisedConnector(connector, 'target'),
        createNormalisedConnector(connector, 'source'),
      );
    } else {
      const connectorName: string =
        getTagValue(connector, TagNames.LocalName, null) ?? connector.name;
      const localName: string = toCamelCase(connectorName);
      const hasSourceCardinality = Boolean(connector.sourceCardinality);
      const tags: EaTag[] = updateNameTag(structuredClone(connector.tags), localName);

      normalisedConnectors.push(
        new NormalizedConnector(
          connector,
          connector.name,
          hasSourceCardinality ?
            connector.destinationObjectId :
            connector.sourceObjectId,
          hasSourceCardinality ?
            connector.sourceObjectId :
            connector.destinationObjectId,
          connector.sourceCardinality ?? connector.destinationCardinality,
          tags,
        ),
      );
    }

    return normalisedConnectors;
  }
}
