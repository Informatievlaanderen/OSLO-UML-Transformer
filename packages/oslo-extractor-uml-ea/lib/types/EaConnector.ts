import { uniqueId } from '@oslo-flanders/core';
import { ConnectorDirection } from '../enums/ConnectorDirection';
import { EaObject } from './EaObject';
import type { EaTag } from './EaTag';

/**
 * Represents a connector in Enterprise Architect
 */
export class EaConnector extends EaObject {
  public readonly type: string;
  public readonly sourceObjectId: number;
  public readonly destinationObjectId: number;
  public readonly sourceCardinality: string;
  public readonly destinationCardinality: string;
  public readonly sourceRole: string;
  public readonly destinationRole: string;
  public readonly associationClassId: number | null;
  public sourceRoleTags: EaTag[] = [];
  public destinationRoleTags: EaTag[] = [];
  public readonly direction: ConnectorDirection;

  // These properties are derived in the DiagramLoader
  public diagramGeometryDirection: ConnectorDirection;
  public hidden: boolean;

  public constructor(
    id: number,
    name: string,
    guid: string,
    type: string,
    sourceObjectId: number,
    destinationObjectId: number,
    sourceCardinality: string,
    destinationCardinality: string,
    sourceRole: string,
    destinationRole: string,
    associationClassId: number | null,
    direction: ConnectorDirection = ConnectorDirection.Unspecified,
  ) {
    super(id, name, guid);

    this.type = type;
    this.sourceObjectId = sourceObjectId;
    this.destinationObjectId = destinationObjectId;
    this.sourceCardinality = sourceCardinality;
    this.destinationCardinality = destinationCardinality;
    this.sourceRole = sourceRole;
    this.destinationRole = destinationRole;
    this.associationClassId = associationClassId;
    this.direction = direction;

    this.diagramGeometryDirection = direction;
    this.hidden = false;

    this.osloGuid = uniqueId(guid, name, id);
  }
}
