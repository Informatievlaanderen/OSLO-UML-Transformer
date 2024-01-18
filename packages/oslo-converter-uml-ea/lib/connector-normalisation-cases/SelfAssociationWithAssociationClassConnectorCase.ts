import { Logger } from '@oslo-flanders/core';
import type {
  EaConnector,
  DataRegistry,
  EaTag,
  EaElement,
} from '@oslo-flanders/ea-uml-extractor';
import {
  NormalizedConnector,
} from '@oslo-flanders/ea-uml-extractor';
import { inject, injectable } from 'inversify';
import { EaUmlConverterServiceIdentifier } from '../config/EaUmlConverterServiceIdentifier';
import { getTagValue, toCamelCase, toPascalCase } from '../utils/utils';
import { TagNames } from '@oslo-converter-uml-ea/enums/TagNames';
import type { IConnectorNormalisationCase } from '@oslo-converter-uml-ea/interfaces/IConnectorNormalisationCase';

@injectable()
export class SelfAssociationWithAssociationClassConnectorCase implements IConnectorNormalisationCase {
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

    const normalisedConnectors: NormalizedConnector[] = [];

    const associationClassObject: EaElement | undefined = dataRegistry.elements.find(
      x => x.id === connector.associationClassId,
    );

    if (!associationClassObject) {
      throw new Error(
        `Unable to find the association class object for connector with path ${connector.path}.`,
      );
    }

    let associationClassName: string = associationClassObject.name;
    const associationClassNameTag: EaTag | undefined = associationClassObject.tags.find(
      x => x.tagName === TagNames.LocalName,
    );

    if (associationClassNameTag) {
      associationClassName = associationClassNameTag.tagValue;
    }

    const baseClassObject: EaElement | undefined = dataRegistry.elements.find(
      x => x.id === connector.sourceObjectId,
    );

    if (!baseClassObject) {
      throw new Error(
        `Unable to find the target object for connector with path ${connector.path}.`,
      );
    }

    let baseClassObjectName: string = baseClassObject.name;
    const baseClassObjectNameTag: EaTag | undefined = baseClassObject.tags.find(
      x => x.tagName === TagNames.LocalName,
    );

    if (baseClassObjectNameTag) {
      baseClassObjectName = baseClassObjectNameTag.tagValue;
    }

    const sourceBaseClassTags: EaTag[] = [
      {
        tagName: TagNames.LocalName,
        tagValue: `${toPascalCase(associationClassName)}.${toCamelCase(
          baseClassObjectName,
        )}.source`,
      },
    ];

    const targetBaseClassTags: EaTag[] = [
      {
        tagName: TagNames.LocalName,
        tagValue: `${toPascalCase(associationClassName)}.${toCamelCase(
          baseClassObjectName,
        )}.target`,
      },
    ];

    normalisedConnectors.push(
      new NormalizedConnector(
        connector,
        `${baseClassObjectName} (source)`,
        connector.associationClassId,
        connector.sourceObjectId,
        '1',
        sourceBaseClassTags,
      ),
      new NormalizedConnector(
        connector,
        `${baseClassObjectName} (target)`,
        connector.associationClassId,
        connector.destinationObjectId,
        '1',
        targetBaseClassTags,
      ),
    );

    return normalisedConnectors;
  }
}
