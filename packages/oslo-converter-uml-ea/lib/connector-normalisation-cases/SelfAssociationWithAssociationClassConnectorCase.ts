import { Logger } from '@oslo-flanders/core';
import type {
  EaConnector,
  DataRegistry,
  EaTag,
  EaElement,
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
   * Case: the connector has an association class and source-target is not the same object.
   *  This case does not handle the case of a self-association.
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

    const ignoreImplicitGeneration = Boolean(
      getTagValue(connector, TagNames.IgnoreImplicitGeneration, false),
    );

    if (ignoreImplicitGeneration) {
      return [];
    }

    // ASSOCIATION CLASS CONNECTORS WITH CUSTOM SOURCE AND TARGET TAGS
    // Filter the prefixes from the tags to allow them to be used by the generators
    // // Replacing the prefixes makes it that this is treated as a normal connector with known tags

    const explicitSourceTags: EaTag[] = connector.sourceRoleTags
      .filter((x) => x.tagName.startsWith(TagNames.AssociationSourcePrefix))
      .map((tag) => ({
        ...tag,
        tagName: tag.tagName.replace(TagNames.AssociationSourcePrefix, ''),
      }));

    const explicitTargetTags: EaTag[] = connector.destinationRoleTags
      .filter((x) => x.tagName.startsWith(TagNames.AssociationDestPrefix))
      .map((tag) => ({
        ...tag,
        tagName: tag.tagName.replace(TagNames.AssociationDestPrefix, ''),
      }));

    const normalisedConnectors: NormalizedConnector[] = [];

    const associationClassObject: EaElement | undefined =
      dataRegistry.elements.find((x) => x.id === connector.associationClassId);

    if (!associationClassObject) {
      throw new Error(
        `Unable to find the association class object for connector with path ${connector.path}.`,
      );
    }

    let associationClassName: string = associationClassObject.name;
    const associationClassNameTag: EaTag | undefined =
      associationClassObject.tags.find((x) => x.tagName === TagNames.LocalName);

    if (associationClassNameTag) {
      associationClassName = associationClassNameTag.tagValue;
    }

    const baseClassObject: EaElement | undefined = dataRegistry.elements.find(
      (x) => x.id === connector.sourceObjectId,
    );

    if (!baseClassObject) {
      throw new Error(
        `Unable to find the target object for connector with path ${connector.path}.`,
      );
    }

    let baseClassObjectName: string = baseClassObject.name;
    const baseClassObjectNameTag: EaTag | undefined = baseClassObject.tags.find(
      (x) => x.tagName === TagNames.LocalName,
    );

    if (baseClassObjectNameTag) {
      baseClassObjectName = baseClassObjectNameTag.tagValue;
    }

    // Create tags for the base class object (source). only source tags are used in self-association
    const sourceBaseClassTags: EaTag[] = [
      ...explicitSourceTags,
      {
        tagName: TagNames.LocalName,
        tagValue: `${toPascalCase(associationClassName)}.${toCamelCase(
          baseClassObjectName,
        )}.source`,
      },
    ];

    // Get reverse tags from association class
    const sourceRevExtraTags: EaTag[] = associationClassObject.tags
      .filter((x) => x.tagName.startsWith(TagNames.AssociationSourceRevPrefix))
      .map((tag) => ({
        ...tag,
        tagName: tag.tagName.replace(TagNames.AssociationSourceRevPrefix, ''),
      }));

    console.log(sourceBaseClassTags, sourceRevExtraTags);

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
