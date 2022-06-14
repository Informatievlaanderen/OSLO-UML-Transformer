import { uniqueId } from '@oslo-flanders/core';
import type { EaTag, EaConnector } from '@oslo-flanders/ea-uml-extractor';
import { EaObject } from '@oslo-flanders/ea-uml-extractor';
import { NormalizedConnectorType } from '../enums/NormalizedConnectorType';

export class NormalizedConnector extends EaObject {
  private readonly innerConnector: EaConnector;
  private readonly normalizedSourceObjectId: number;
  private readonly normalizedDestinationObjectId: number;
  private readonly normalizedCardinality: string;
  private readonly normalizedType: NormalizedConnectorType;

  public constructor(
    innerConnector: EaConnector,
    name: string,
    sourceObjectId: number,
    destinationObjectId: number,
    cardinality: string,
    tags: EaTag[] = [],
    type: NormalizedConnectorType = NormalizedConnectorType.RegularConnector,
  ) {
    super(
      Math.floor(Math.random() * Date.now()),
      name,
      innerConnector.eaGuid,
    );
    this.innerConnector = innerConnector;
    this.normalizedSourceObjectId = sourceObjectId;
    this.normalizedDestinationObjectId = destinationObjectId;
    this.normalizedCardinality = cardinality;
    this.normalizedType = type;
    this.tags = tags;

    if (name) {
      this.addNameTag(name);
    }

    this.osloGuid = uniqueId(innerConnector.eaGuid, name, sourceObjectId);
  }

  public get innerConnectorName(): string {
    return this.innerConnector.name;
  }

  public get innerConnectorId(): number {
    return this.innerConnector.id;
  }

  public get innerConnectorType(): string {
    return this.innerConnector.type;
  }

  public get sourceObjectId(): number {
    return this.normalizedSourceObjectId;
  }

  public get destinationObjectId(): number {
    return this.normalizedDestinationObjectId;
  }

  public get cardinality(): string {
    return this.normalizedCardinality;
  }

  public get type(): NormalizedConnectorType {
    return this.normalizedType;
  }

  public get path(): string {
    return this.innerConnector.path;
  }

  public set path(value: string) {
    this.innerConnector.path = value;
  }

  public addNameTag(name: string): void {
    const tag: EaTag = {
      id: 0,
      tagName: 'name',
      tagValue: name,
    };

    if (this.tags.some(x => x.tagName === 'name')) {
      return;
    }

    this.tags = [...this.tags, tag];
  }
}
