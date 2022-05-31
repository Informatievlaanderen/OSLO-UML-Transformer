import { uniqueId } from '@oslo-flanders/core';
import { EaObject } from './EaObject';

/**
 * Represents a diagram in Enterprise Architect
 */
export class EaDiagram extends EaObject {
  public readonly packageId: number;
  public connectorsIds: number[];
  public elementIds: number[];

  public constructor(
    id: number,
    name: string,
    guid: string,
    packageId: number,
  ) {
    super(id, name, guid);

    this.packageId = packageId;
    this.connectorsIds = [];
    this.elementIds = [];

    this.osloGuid = uniqueId();
  }
}
