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
export class AssocationWithSourceRoleConnectorCase
  implements IConnectorNormalisationCase
{
  @inject(EaUmlConverterServiceIdentifier.Logger)
  public readonly logger!: Logger;

  /**
   * Case: the connector is an association with a source role
   *  Self-associations with a source rol are also handled here
   * @param connector The connector to normalise
   * @param dataRegistry The registry to use to extract relevant information from other elements
   * @returns An array of normalised connectors
   */
  public async normalise(
    connector: EaConnector,
    dataRegistry: DataRegistry,
  ): Promise<NormalizedConnector[]> {
    if (!connector.sourceRole) {
      this.logger.info(
        `Connector ${connector.path} is not an association with a source role. Ignoring this connector.`,
      );
      return [];
    }
    if (!connector.name) {
      this.logger.info(
        `Connector ${connector.path} has no name. Ignoring this connector.`,
      );
      return [];
    }

    const localName: string = toCamelCase(
      getTagValue(connector, TagNames.LocalName, null) ?? connector.sourceRole,
    );

    const tags: EaTag[] = structuredClone(connector.sourceRoleTags);
    updateNameTag(tags, localName);

    return [
      new NormalizedConnector(
        connector,
        connector.sourceRole,
        connector.destinationObjectId,
        connector.sourceObjectId,
        connector.sourceCardinality,
        tags,
      ),
    ];
  }
}
