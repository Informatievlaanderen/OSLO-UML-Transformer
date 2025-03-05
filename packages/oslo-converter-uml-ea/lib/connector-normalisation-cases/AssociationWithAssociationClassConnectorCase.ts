import { Logger } from '@oslo-flanders/core';
import type {
  DataRegistry,
  EaConnector,
  EaElement,
} from '@oslo-flanders/ea-uml-extractor';
import { NormalizedConnector } from '@oslo-flanders/ea-uml-extractor';
import { inject, injectable } from 'inversify';
import { EaUmlConverterServiceIdentifier } from '../config/EaUmlConverterServiceIdentifier';
import { TagNames } from '../enums/TagNames';
import type { IConnectorNormalisationCase } from '../interfaces/IConnectorNormalisationCase';
import { getTagValue, toCamelCase, toPascalCase } from '../utils/utils';

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
    dataRegistry: DataRegistry,
  ): Promise<NormalizedConnector[]> {
    if (
      !connector.associationClassId ||
      connector.sourceObjectId === connector.destinationObjectId
    ) {
      return [];
    }

    const ignoreImplicitGeneration = Boolean(
      getTagValue(connector, TagNames.IgnoreImplicitGeneration, false),
    );

    if (ignoreImplicitGeneration) {
      return [];
    }

    const normalisedConnectors: NormalizedConnector[] = [];
    const associationClassObject = dataRegistry.elements.find(
      (x) => x.id === connector.associationClassId,
    );

    if (!associationClassObject) {
      throw new Error(
        `Unable to find the association class object for connector with path ${connector.path}.`,
      );
    }

    const associationClassName: string =
      getTagValue(associationClassObject, TagNames.LocalName, null) ??
      associationClassObject.name;

    const sourceObject: EaElement | undefined = dataRegistry.elements.find(
      (x) => x.id === connector.sourceObjectId,
    );
    if (!sourceObject) {
      throw new Error(
        `Unable to find the source object for connector with path ${connector.path}.`,
      );
    }

    const sourceObjectName: string =
      getTagValue(sourceObject, TagNames.LocalName, null) ?? sourceObject.name;

    const sourceLocalName = `${toPascalCase(
      associationClassName,
    )}.${toCamelCase(sourceObjectName)}`;

    const sourceTags = connector.sourceRoleTags.filter((x) =>
      x.tagName.startsWith(TagNames.DefiningPackage),
    );

    normalisedConnectors.push(
      new NormalizedConnector(
        connector,
        `${associationClassName}.${sourceObjectName}`,
        connector.associationClassId,
        connector.sourceObjectId,
        '1',
        [
          ...sourceTags,
          {
            tagName: TagNames.LocalName,
            tagValue: sourceLocalName,
          },
        ],
      ),
    );

    const destinationObject: EaElement | undefined = dataRegistry.elements.find(
      (x) => x.id === connector.destinationObjectId,
    );
    if (!destinationObject) {
      throw new Error(
        `Unable to find the destination object for connector with path ${connector.path}.`,
      );
    }

    const destinationObjectName: string =
      getTagValue(destinationObject, TagNames.LocalName, null) ??
      destinationObject.name;

    const destinationLocalName = `${toPascalCase(
      associationClassName,
    )}.${toCamelCase(destinationObjectName)}`;

    const destinationTags = connector.destinationRoleTags.filter((x) =>
      x.tagName.startsWith(TagNames.DefiningPackage),
    );

    normalisedConnectors.push(
      new NormalizedConnector(
        connector,
        `${associationClassName}.${destinationObjectName}`,
        connector.associationClassId,
        connector.destinationObjectId,
        '1',
        [
          ...destinationTags,
          {
            tagName: TagNames.LocalName,
            tagValue: destinationLocalName,
          },
        ],
      ),
    );

    return normalisedConnectors;
  }
}
