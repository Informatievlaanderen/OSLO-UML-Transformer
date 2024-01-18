import { Logger } from '@oslo-flanders/core';
import type {
  EaConnector,
  DataRegistry,
  EaTag,
} from '@oslo-flanders/ea-uml-extractor';
import {
  NormalizedConnector,
} from '@oslo-flanders/ea-uml-extractor';
import { inject, injectable } from 'inversify';
import { EaUmlConverterServiceIdentifier } from '../config/EaUmlConverterServiceIdentifier';
import { TagNames } from '@oslo-converter-uml-ea/enums/TagNames';
import type { IConnectorNormalisationCase } from '@oslo-converter-uml-ea/interfaces/IConnectorNormalisationCase';
import { getTagValue, toCamelCase, updateNameTag } from '@oslo-converter-uml-ea/utils/utils';

@injectable()
export class AssociationWithDestinationRoleConnectorCase implements IConnectorNormalisationCase {
  @inject(EaUmlConverterServiceIdentifier.Logger)
  public readonly logger!: Logger;

  /**
   * Case: the connector is an association with a destination role
   *  Self-associations with a destination rol are also handled here
   * @param connector The connector to normalise
   * @param dataRegistry The registry to use to extract relevant information from other elements
   * @returns An array of normalised connectors
   */
  public async normalise(
    connector: EaConnector,
    dataRegistry: DataRegistry,
  ): Promise<NormalizedConnector[]> {
    if (!connector.destinationRole || connector.name) {
      return [];
    }

    const localName: string = toCamelCase(
      getTagValue(connector.destinationRoleTags, TagNames.LocalName, null) ??
      connector.destinationRole,
    );

    const tags: EaTag[] = structuredClone(connector.destinationRoleTags);
    updateNameTag(tags, localName);

    return [
      new NormalizedConnector(
        connector,
        connector.destinationRole,
        connector.sourceObjectId,
        connector.destinationObjectId,
        connector.destinationCardinality,
        tags,
      ),
    ];
  }
}
