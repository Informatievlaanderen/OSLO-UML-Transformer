import { uniqueId } from '@oslo-flanders/core';
import { EaObject } from './EaObject';
import type { CrossReferenceType } from '../enums/CrossReferenceType';

/**
 * Represents a cross reference in Enterprise Architect
 */
export class EaCrossReference extends EaObject {
  public readonly type: CrossReferenceType;
  public readonly packageId: number;
  public readonly parentEaGuid: string;

  public constructor(
    id: number,
    name: string,
    guid: string,
    parentEaGuid: string,
    packageId: number,
    type: CrossReferenceType,
  ) {
    super(id, name, guid);

    this.type = type;
    this.packageId = packageId;
    this.parentEaGuid = parentEaGuid;
    this.osloGuid = uniqueId(guid, name, id);
  }

  public get childEaGuid(): string {
    return this.eaGuid;
  }
}
