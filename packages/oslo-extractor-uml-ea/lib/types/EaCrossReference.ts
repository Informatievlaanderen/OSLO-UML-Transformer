import { uniqueId } from '@oslo-flanders/core';
import { EaObject } from './EaObject';
import type { CrossReferenceType } from '../enums/CrossReferenceType';

/**
 * Represents a cross reference in Enterprise Architect
 */
export class EaCrossReference extends EaObject {
  private _type: CrossReferenceType;
  private _packageId: number;
  private _childOsloGuid: string;
  private _parentOsloGuid: string;

  public constructor(
    id: number,
    name: string,
    guid: string,
    packageId: number,
    childId: number,
    childName: string,
    childGuid: string,
    parentId: number,
    parentName: string,
    parentGuid: string,
    type: CrossReferenceType,
  ) {
    super(id, name, guid);

    this.osloGuid = uniqueId(guid, name, id);
    this._type = type;
    this._packageId = packageId;
    this._childOsloGuid = uniqueId(childGuid, childName, childId);
    this._parentOsloGuid = uniqueId(parentGuid, parentName, parentId);
  }

  public get type(): CrossReferenceType {
    return this._type;
  }

  public get packageId(): number {
    return this._packageId;
  }

  public get childOsloGuid(): string {
    return this._childOsloGuid;
  }

  public get parentOsloGuid(): string {
    return this._parentOsloGuid;
  }
}
