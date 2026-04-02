import { uniqueId } from '@oslo-flanders/core';
import type { ElementType } from '../enums/ElementType';
import { EaObject } from '../types/EaObject';

/**
 * Represents an element in Enterprise Architect
 * @see ElementType for possible types of an EaElement
 */
export class EaElement extends EaObject {
  public readonly type: ElementType;
  public readonly packageId: number;
  public readonly abstract: boolean;
  public readonly root: boolean;

  public constructor(
    id: number,
    name: string,
    guid: string,
    type: ElementType,
    packageId: number,
    abstract: number,
    root: number,
  ) {
    super(id, name, guid);

    this.type = type;
    this.packageId = packageId;
    this.abstract = Boolean(abstract);
    this.root = Boolean(root);

    this.osloGuid = uniqueId(guid, name, id);
  }
}
