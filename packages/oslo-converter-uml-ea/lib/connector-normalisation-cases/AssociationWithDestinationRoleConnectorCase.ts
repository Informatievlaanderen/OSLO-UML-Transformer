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
import { getTagValue, toCamelCase, updateNameTag } from '../utils/utils';

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
    dataRegistry: DataRegistry,
  ): Promise<NormalizedConnector[]> {
    if (!connector.destinationRole || connector.name) {
      if (connector.name) {
        this.logger.info(
          `Connector ${connector.path} has name "${connector.name}". but no destination role. Ignoring therefore this connector. If required to be present add a role or cardinality.`,
        );
      }
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
