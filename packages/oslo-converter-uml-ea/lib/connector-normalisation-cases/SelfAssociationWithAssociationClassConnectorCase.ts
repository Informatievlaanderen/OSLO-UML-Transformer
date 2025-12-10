import { Logger } from '@oslo-flanders/core';
import type {
  EaConnector,
  DataRegistry,
  EaTag,
} from '@oslo-flanders/ea-uml-extractor';
import { NormalizedConnector } from '@oslo-flanders/ea-uml-extractor';
import { inject, injectable } from 'inversify';
import { EaUmlConverterServiceIdentifier } from '../config/EaUmlConverterServiceIdentifier';
import { TagNames } from '../enums/TagNames';
import type { IConnectorNormalisationCase } from '../interfaces/IConnectorNormalisationCase';
import { getTagValue, toCamelCase, toPascalCase } from '../utils/utils';

@injectable()
export class SelfAssociationWithAssociationClassConnectorCase
  implements IConnectorNormalisationCase
{
  @inject(EaUmlConverterServiceIdentifier.Logger)
  public readonly logger!: Logger;

  /**
   * Case: the connector has an association class and source-target is the same object (self-association).
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
      connector.sourceObjectId !== connector.destinationObjectId
    ) {
      return [];
    }

    if (
      Boolean(getTagValue(connector, TagNames.IgnoreImplicitGeneration, false))
    ) {
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

    const baseClassObject = dataRegistry.elements.find(
      (x) => x.id === connector.sourceObjectId,
    );

    if (!baseClassObject) {
      throw new Error(
        `Unable to find the target object for connector with path ${connector.path}.`,
      );
    }

    const baseClassObjectName: string =
      getTagValue(baseClassObject, TagNames.LocalName, null) ??
      baseClassObject.name;

    const sourceTags = connector.sourceRoleTags.filter((x) =>
      x.tagName.startsWith(TagNames.DefiningPackage),
    );

    // propagate the tags on the association class to the implicit connector.
    // As the connector (properties/relationships) are implicit one has to make a choice where to put this information.
    // The connector should only be created when the associationclass is present on the diagram, and therefore the tags are located on the association class.
    // Because of the implicit relationships it is impossible to have the same class participate in two distinct association class relationships.
    // If one need that functionality, the only solution is to create duplicate classes and copy the information.
    // Replacing the prefixes makes it that this is treated as a normal connector with known tags
    const sourceExtraTags: EaTag[] = associationClassObject.tags
      .filter((x) => x.tagName.startsWith(TagNames.AssociationSourcePrefix))
      .map((tag) => ({
        ...tag,
        tagName: tag.tagName.replace(TagNames.AssociationSourcePrefix, ''),
      }));

    const sourceBaseClassTags: EaTag[] = [
      ...sourceExtraTags,
      {
        tagName: TagNames.LocalName,
        tagValue: `${toPascalCase(associationClassName)}.${toCamelCase(
          baseClassObjectName,
        )}.source`,
      },
    ];

    // Get reverse tags from association class
    const sourceRevExtraTags: EaTag[] = connector.tags
      .filter((x) => x.tagName.startsWith(TagNames.AssociationSourceRevPrefix))
      .map((tag) => ({
        ...tag,
        tagName: tag.tagName.replace(TagNames.AssociationSourceRevPrefix, ''),
      }));

    normalisedConnectors.push(
      new NormalizedConnector(
        connector,
        `${baseClassObjectName} (source)`,
        connector.associationClassId,
        connector.sourceObjectId,
        '1',
        [...sourceBaseClassTags, ...sourceRevExtraTags],
      ),
    );

    return normalisedConnectors;
  }
}
