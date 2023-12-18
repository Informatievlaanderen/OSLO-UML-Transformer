import {
  EaConnector,
  DataRegistry,
  NormalizedConnector,
  EaTag,
} from '@oslo-flanders/ea-uml-extractor';
import { IConnectorNormalisationCase } from '../interfaces/IConnectorNormalisationCase';
import { TagNames } from '../enums/TagNames';
import { getTagValue, toCamelCase, toPascalCase } from '../utils/utils';
import { inject, injectable } from 'inversify';
import { Logger } from '@oslo-flanders/core';
import { EaUmlConverterServiceIdentifier } from '../config/EaUmlConverterServiceIdentifier';

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
    dataRegistry: DataRegistry
  ): Promise<NormalizedConnector[]> {
    if (
      connector.associationClassId === null ||
      connector.sourceObjectId !== connector.destinationObjectId
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
      console.log(connector);
      throw new Error(
        `Unable to find the association class object for connector with path ${connector.path}.`
      );
    }

    let associationClassName = associationClassObject.name;
    const associationClassNameTag = associationClassObject.tags.find(
      (x) => x.tagName === TagNames.LocalName
    );
    if (associationClassNameTag) {
      associationClassName = associationClassNameTag.tagValue;
    }

    const baseClassObject = dataRegistry.elements.find(
      (x) => x.id === connector.sourceObjectId
    );
    if (!baseClassObject) {
      throw new Error(
        `Unable to find the target object for connector with path ${connector.path}.`
      );
    }

    let baseClassObjectName = baseClassObject.name;
    const baseClassObjectNameTag = baseClassObject.tags.find(
      (x) => x.tagName === TagNames.LocalName
    );
    if (baseClassObjectNameTag) {
      baseClassObjectName = baseClassObjectNameTag.tagValue;
    }

    const sourceBaseClassTags: EaTag[] = [
      {
        tagName: TagNames.LocalName,
        tagValue: `${toPascalCase(associationClassName)}.${toCamelCase(
          baseClassObjectName
        )}.source`,
      },
    ];

    const targetBaseClassTags: EaTag[] = [
      {
        tagName: TagNames.LocalName,
        tagValue: `${toPascalCase(associationClassName)}.${toCamelCase(
          baseClassObjectName
        )}.target`,
      },
    ];

    normalisedConnectors.push(
      new NormalizedConnector(
        connector,
        `${baseClassObjectName} (source)`,
        connector.associationClassId!,
        connector.sourceObjectId,
        '1',
        sourceBaseClassTags
      ),
      new NormalizedConnector(
        connector,
        `${baseClassObjectName} (target)`,
        connector.associationClassId!,
        connector.destinationObjectId,
        '1',
        targetBaseClassTags
      )
    );

    return normalisedConnectors;
  }
}
