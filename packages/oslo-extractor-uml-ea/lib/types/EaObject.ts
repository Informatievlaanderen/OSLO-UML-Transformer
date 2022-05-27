import { getLoggerFor } from '../../../oslo-core';
import type { EaTag } from './EaTag';

export abstract class EaObject {
  protected readonly logger = getLoggerFor(this);
  public readonly id: number;
  public readonly name: string;
  public readonly eaGuid: string;
  private _osloGuid: string | undefined;
  private _path: string | undefined;
  public tags: EaTag[];

  public constructor(id: number, name: string, guid: string) {
    this.id = id;
    this.name = name;
    this.eaGuid = guid;
    this.tags = [];
  }

  public get osloGuid(): string {
    if (!this._osloGuid) {
      throw new Error(`Oslo guid has not been set yet for object with EA guid ${this.eaGuid}.`);
    }
    return this._osloGuid;
  }

  public set osloGuid(value: string) {
    this._osloGuid = value;
  }

  public get path(): string {
    if (!this._path) {
      this.logger.warn(`Path has not been set for ${this.constructor.name} with EA guid ${this.eaGuid}. Returning its name ${this.name}.`);
      return this.name;
    }

    return this._path;
  }

  public set path(value: string) {
    this._path = value;
  }
}
