import {
  DataRegistry,
  EaConnector,
  EaTag,
  NormalizedConnector,
} from '@oslo-flanders/ea-uml-extractor';
import { IConnectorNormalisationCase } from '../interfaces/IConnectorNormalisationCase';
import { TagNames } from '../enums/TagNames';
import { getTagValue, toCamelCase, toPascalCase } from '../utils/utils';
import { inject, injectable } from 'inversify';
import { EaUmlConverterServiceIdentifier } from '../config/EaUmlConverterServiceIdentifier';
import { Logger } from '@oslo-flanders/core';

@injectable()
export class AssociationWithAssociationClassConnectorCase
  implements IConnectorNormalisationCase
{
  @inject(EaUmlConverterServiceIdentifier.Logger)
  public readonly logger!: Logger;

  /**
   * Case: the connector is a self-association with an association class.
   * @param connector The connector to normalise
   * @param dataRegistry The registry to use to extract relevant information from other elements
   * @returns An array of normalised connectors
   */
  public async normalise(
    connector: EaConnector,
    dataRegistry: DataRegistry
  ): Promise<NormalizedConnector[]> {
    if (
      connector.associationClassId === null ||
      connector.sourceObjectId === connector.destinationObjectId
    ) {
      return [];
    }

    const ignoreImplicitGeneration = Boolean(
      getTagValue(connector, TagNames.IgnoreImplicitGeneration, false)
    );

    if (ignoreImplicitGeneration === true) {
      return [];
    }

    const normalisedConnectors: NormalizedConnector[] = [];
    const associationClassObject = dataRegistry.elements.find(
      (x) => x.id === connector.associationClassId
    );

    if (!associationClassObject) {
      throw new Error(
        `Unable to find the association class object for connector with path ${connector.path}.`
      );
    }

    const associationClassName = getTagValue(associationClassObject, TagNames.LocalName, null) ?? associationClassObject.name;

    const sourceObject = dataRegistry.elements.find(
      (x) => x.id === connector.sourceObjectId
    );
    if (!sourceObject) {
      throw new Error(
        `Unable to find the source object for connector with path ${connector.path}.`
      );
    }

    const sourceObjectName = getTagValue(sourceObject, TagNames.LocalName, null) ?? sourceObject.name;

    const sourceLocalName = `${toPascalCase(
      associationClassName
    )}.${toCamelCase(sourceObjectName)}`;

    normalisedConnectors.push(
      new NormalizedConnector(
        connector,
        `${associationClassName}.${sourceObjectName}`,
        connector.associationClassId!,
        connector.sourceObjectId,
        '1',
        [
          {
            tagName: TagNames.LocalName,
            tagValue: sourceLocalName,
          },
        ]
      )
    );

    const destinationObject = dataRegistry.elements.find(
      (x) => x.id === connector.destinationObjectId
    );
    if (!destinationObject) {
      throw new Error(
        `Unable to find the destination object for connector with path ${connector.path}.`
      );
    }

    const destinationObjectName = getTagValue(destinationObject, TagNames.LocalName, null) ?? destinationObject.name;

    const destinationLocalName = `${toPascalCase(
      associationClassName
    )}.${toCamelCase(destinationObjectName)}`;

    normalisedConnectors.push(
      new NormalizedConnector(
        connector,
        `${associationClassName}.${destinationObjectName}`,
        connector.associationClassId!,
        connector.destinationObjectId,
        '1',
        [
          {
            tagName: TagNames.LocalName,
            tagValue: destinationLocalName,
          },
        ]
      )
    );

    return normalisedConnectors;
  }
}
