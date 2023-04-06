import { uniqueId } from '@oslo-flanders/core';
import { NormalizedConnectorTypes } from '../enums/NormalizedConnectorTypes';
import type { EaConnector } from './EaConnector';
import { EaObject } from './EaObject';
import type { EaTag } from './EaTag';

export class NormalizedConnector extends EaObject {
  private readonly _sourceObjectId: number;
  private readonly _destinationObjectId: number;
  private readonly _cardinality: string;
  private readonly _type: NormalizedConnectorTypes;
  private readonly _originalId: number;
  private readonly _originalType: string;

  public constructor(
    originalConnector: EaConnector,
    name: string,
    sourceObjectId: number,
    destinationObjectId: number,
    cardinality: string,
    tags: EaTag[] = [],
    type: NormalizedConnectorTypes = NormalizedConnectorTypes.RegularConnector,
  ) {
    super(
      Math.floor(Math.random() * Date.now()),
      name,
      originalConnector.eaGuid,
    );
    this._sourceObjectId = sourceObjectId;
    this._destinationObjectId = destinationObjectId;
    this._cardinality = cardinality;
    this._type = type;
    this.tags = tags;

    this._originalId = originalConnector.id;
    this._originalType = originalConnector.type;

    this.osloGuid = uniqueId(originalConnector.eaGuid, name, sourceObjectId);
  }

  /**
   * Return the id of the original EaConnector
   */
  public get originalId(): number {
    return this._originalId;
  }

  public get sourceObjectId(): number {
    return this._sourceObjectId;
  }

  public get destinationObjectId(): number {
    return this._destinationObjectId;
  }

  public get cardinality(): string {
    return this._cardinality;
  }

  public get originalType(): string {
    return this._originalType;
  }

  public get type(): NormalizedConnectorTypes {
    return this._type;
  }
}
