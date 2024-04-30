import { uniqueId } from '@oslo-flanders/core';
import { EaObject } from './EaObject';

/**
 * Represents an attribute in Enterprise Architect
 */
export class EaAttribute extends EaObject {
  public readonly classId: number;
  public readonly type: string;
  public readonly lowerBound: string;
  public readonly upperBound: string;
  public readonly rangeClassId: number | undefined;

  public constructor(
    id: number,
    name: string,
    guid: string,
    classId: number,
    type: string,
    lowerBound: string,
    upperBound: string,
    rangeClassId?: number,
  ) {
    super(id, name, guid);

    this.classId = classId;
    this.type = type;
    this.lowerBound = lowerBound;
    this.upperBound = upperBound;
    this.rangeClassId = rangeClassId;

    this.osloGuid = uniqueId(guid, name, id);
  }
}
