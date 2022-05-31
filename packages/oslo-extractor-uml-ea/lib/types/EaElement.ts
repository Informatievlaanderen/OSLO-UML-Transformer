import { uniqueId } from '@oslo-flanders/core';
import type { ElementType } from '../enums/ElementType';
import { EaObject } from './EaObject';

/**
 * Represents an element in Enterprise Architect
 * @see ElementType for possible types of an EaElement
 */
export class EaElement extends EaObject {
  public readonly type: ElementType;
  public readonly packageId: number;

  public constructor(
    id: number,
    name: string,
    guid: string,
    type: ElementType,
    packageId: number,
  ) {
    super(id, name, guid);

    this.type = type;
    this.packageId = packageId;

    this.osloGuid = uniqueId();
  }
}
