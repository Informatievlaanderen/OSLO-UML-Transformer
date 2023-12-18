import {
  EaConnector,
  DataRegistry,
  NormalizedConnector,
  EaTag,
} from '@oslo-flanders/ea-uml-extractor';
import { IConnectorNormalisationCase } from '../interfaces/IConnectorNormalisationCase';
import { TagNames } from '../enums/TagNames';
import { getTagValue, toCamelCase, updateNameTag } from '../utils/utils';
import { inject, injectable } from 'inversify';
import { Logger } from '@oslo-flanders/core';
import { EaUmlConverterServiceIdentifier } from '../config/EaUmlConverterServiceIdentifier';

@injectable()
export class AssociationWithDestinationRoleConnectorCase
  implements IConnectorNormalisationCase
{
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
    dataRegistry: DataRegistry
  ): Promise<NormalizedConnector[]> {
    if (connector.destinationRole === null || connector.name !== null) {
      return [];
    }

    const localName = toCamelCase(
      getTagValue(connector.destinationRoleTags, TagNames.LocalName, null) ??
        connector.destinationRole
    );

    const tags = structuredClone(connector.destinationRoleTags);
    updateNameTag(tags, localName);

    return [
      new NormalizedConnector(
        connector,
        connector.destinationRole,
        connector.sourceObjectId,
        connector.destinationObjectId,
        connector.destinationCardinality,
        tags
      ),
    ];
  }
}
