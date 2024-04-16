import { Logger, QuadStore } from '@oslo-flanders/core';
import { TranslationService } from '@oslo-generator-shacl-template/TranslationService';
import { ShaclTemplateGenerationServiceConfiguration } from '@oslo-generator-shacl-template/config/ShaclTemplateGenerationServiceConfiguration';
import { ShaclTemplateGenerationServiceIdentifier } from '@oslo-generator-shacl-template/config/ShaclTemplateGenerationServiceIdentifier';
import type * as RDF from '@rdfjs/types';
import { inject, injectable } from 'inversify';
import { DataFactory } from 'rdf-data-factory';

export type NamedOrBlankNode = RDF.NamedNode | RDF.BlankNode;

export interface IHandler {
  setNext: (handler: IHandler) => IHandler;
  handle: (subject: NamedOrBlankNode, store: QuadStore, shaclStore: QuadStore) => void;
}

@injectable()
export class ShaclHandler implements IHandler {
  private next: IHandler | undefined;
  protected df: DataFactory = new DataFactory();
  protected readonly config: ShaclTemplateGenerationServiceConfiguration;

  protected readonly translationService: TranslationService;
  protected readonly logger: Logger;
  private _classIdToShapeIdMap: Map<string, NamedOrBlankNode> | undefined;
  private _propertyIdToShapeIdMap: Map<string, NamedOrBlankNode> | undefined;

  public constructor(
    @inject(ShaclTemplateGenerationServiceIdentifier.Configuration) config: ShaclTemplateGenerationServiceConfiguration,
    @inject(ShaclTemplateGenerationServiceIdentifier.Logger) logger: Logger,
    @inject(ShaclTemplateGenerationServiceIdentifier.TranslationService) translationService: TranslationService,
  ) {
    this.config = config;
    this.logger = logger;
    this.translationService = translationService;
  }

  public setNext(handler: IHandler): IHandler {
    this.next = handler;
    return handler;
  }

  public handle(subject: NamedOrBlankNode, store: QuadStore, shaclStore: QuadStore): void {
    if (this.next) {
      return this.next.handle(subject, store, shaclStore);
    }
  }

  public set classIdToShapeIdMap(value: Map<string, NamedOrBlankNode>) {
    this._classIdToShapeIdMap = value;
  }

  public get classIdToShapeIdMap(): Map<string, NamedOrBlankNode> {
    if (!this._classIdToShapeIdMap) {
      throw new Error('Trying to access "classIdToShapeIdMap" before it is set.')
    }
    return this._classIdToShapeIdMap
  }

  public set propertyIdToShapeIdMap(value: Map<string, NamedOrBlankNode>) {
    this._propertyIdToShapeIdMap = value;
  }

  public get propertyIdToShapeIdMap(): Map<string, NamedOrBlankNode> {
    if (!this._propertyIdToShapeIdMap) {
      throw new Error('Trying to access "propertyIdToShapeIdMap" before it is set.')
    }
    return this._propertyIdToShapeIdMap
  }
}