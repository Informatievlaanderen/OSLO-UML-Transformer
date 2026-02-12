import { Logger } from '@oslo-flanders/core';
import type {
  DataRegistry,
  EaConnector,
  EaElement,
  EaTag,
} from '@oslo-flanders/ea-uml-extractor';
import { NormalizedConnector } from '@oslo-flanders/ea-uml-extractor';
import { inject, injectable } from 'inversify';
import { EaUmlConverterServiceIdentifier } from '../config/EaUmlConverterServiceIdentifier';
import { TagNames } from '../enums/TagNames';
import type { IConnectorNormalisationCase } from '../interfaces/IConnectorNormalisationCase';
import { getTagValue } from '../utils/utils';

@injectable()
export class AssociationWithAssociationClassConnectorCase
  implements IConnectorNormalisationCase
{
  @inject(EaUmlConverterServiceIdentifier.Logger)
  public readonly logger!: Logger;

  /**
   * Case: the connector has an association class and source-target is a different object.
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

    const sourceTags = connector.sourceRoleTags.filter((x) =>
      x.tagName.startsWith(TagNames.DefiningPackage),
    );

    //
    // propagate the tags on the association class to the implicit connectors.
    // As the connectors (properties/relationships) are implicit one has to make a choice where to put this information.
    // The connectors should only be created when the associationclass is present on the diagram, and therefore the tags are located on the association class.
    // Because of the implicit relationships it is impossible to have the same class participate in two distinct association class relationships.
    // If one need that functionality, the only solution is to create duplicate classes and copy the information.
    // Replacing the prefixes makes it that this is treated as a normal connector with known tags
    const sourceExtraTags: EaTag[] = associationClassObject.tags
      .filter((x) => x.tagName.startsWith(TagNames.AssociationSourcePrefix))
      .map((tag) => ({
        ...tag,
        tagName: tag.tagName.replace(TagNames.AssociationSourcePrefix, ''),
      }));

    const destinationExtraTags: EaTag[] = associationClassObject.tags
      .filter((x) => x.tagName.startsWith(TagNames.AssociationDestPrefix))
      .map((tag) => ({
        ...tag,
        tagName: tag.tagName.replace(TagNames.AssociationDestPrefix, ''),
      }));
    const sTags = sourceTags.concat(sourceExtraTags);

    // Extending it with default values should be done after checking this list
    // Better apply the new practice: values are explicit in the EA UML model.
    // Maybe the removal of the name is problematic as it might lead to invalid assigned URI
    // In that case this has to be extended with the remove lines for the tagNames.LocalName

    normalisedConnectors.push(
      new NormalizedConnector(
        connector,
        `${associationClassName}.${sourceObjectName}`,
        connector.associationClassId,
        connector.sourceObjectId,
        '1',
        sTags,
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

    const destinationTags = connector.destinationRoleTags.filter((x) =>
      x.tagName.startsWith(TagNames.DefiningPackage),
    );

    const dTags = destinationTags.concat(destinationExtraTags); // Extending it with default values should be done after checking this list

    normalisedConnectors.push(
      new NormalizedConnector(
        connector,
        `${associationClassName}.${destinationObjectName}`,
        connector.associationClassId,
        connector.destinationObjectId,
        '1',
        dTags,
      ),
    );

    // reverse behaviour of the destination tags and source tags
    const sourceRevExtraTags: EaTag[] = associationClassObject.tags
      .filter((x) => x.tagName.startsWith(TagNames.AssociationSourceRevPrefix))
      .map((tag) => ({
        ...tag,
        tagName: tag.tagName.replace(TagNames.AssociationSourceRevPrefix, ''),
      }));

    const destinationRevExtraTags: EaTag[] = associationClassObject.tags
      .filter((x) => x.tagName.startsWith(TagNames.AssociationDestRevPrefix))
      .map((tag) => ({
        ...tag,
        tagName: tag.tagName.replace(TagNames.AssociationDestRevPrefix, ''),
      }));

    // Push the reverse tags from the association class to the source and destination

    if (sourceRevExtraTags.length) {
      normalisedConnectors.push(
        new NormalizedConnector(
          connector,
          `${sourceObjectName}.${associationClassName}`,
          connector.sourceObjectId,
          connector.associationClassId,
          // The cardinality for the reverse relationship is not explicitly defined in EA
          // as the relationship is implicit. We use the cardinality of the connector's destination with '1' as a fallback.
          connector.destinationCardinality ?? '1',
          sourceRevExtraTags,
        ),
      );
    }

    if (destinationRevExtraTags.length) {
      normalisedConnectors.push(
        new NormalizedConnector(
          connector,
          `${sourceObjectName}.${associationClassName}`,
          connector.destinationObjectId,
          connector.associationClassId,
          // The cardinality for the reverse relationship is not explicitly defined in EA
          // as the relationship is implicit. We use the cardinality of the connector's source with '1' as a fallback.
          connector.sourceCardinality ?? '1',
          destinationRevExtraTags,
        ),
      );
    }

    return normalisedConnectors;
  }
}
