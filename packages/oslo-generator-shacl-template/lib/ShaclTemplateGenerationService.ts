import { IService, Logger, QuadStore, getApplicationProfileLabel, ns, } from "@oslo-flanders/core";
import { ShaclTemplateGenerationServiceConfiguration } from "./config/ShaclTemplateGenerationServiceConfiguration";
import { inject, injectable } from "inversify";
import type * as RDF from '@rdfjs/types';
import { NamedOrBlankNode } from "./types/IHandler";
import { DataFactory } from 'rdf-data-factory';
import { PipelineService } from "./PipelineService";
import { ShaclTemplateGenerationServiceIdentifier } from "./config/ShaclTemplateGenerationServiceIdentifier";
import { OutputHandlerService } from "@oslo-generator-shacl-template/OutputHandlerService";
import { GenerationMode } from "./enums/GenerationMode";
import { toPascalCase } from "./utils/utils";

@injectable()
export class ShaclTemplateGenerationService implements IService {
  public readonly logger: Logger;
  public readonly configuration: ShaclTemplateGenerationServiceConfiguration;
  public readonly store: QuadStore;
  private readonly pipelineService: PipelineService;
  private readonly outputHandlerService: OutputHandlerService;

  public constructor(
    @inject(ShaclTemplateGenerationServiceIdentifier.Logger) logger: Logger,
    @inject(ShaclTemplateGenerationServiceIdentifier.Configuration) config: ShaclTemplateGenerationServiceConfiguration,
    @inject(ShaclTemplateGenerationServiceIdentifier.QuadStore) store: QuadStore,
    @inject(ShaclTemplateGenerationServiceIdentifier.PipelineService) pipelineService: PipelineService,
    @inject(ShaclTemplateGenerationServiceIdentifier.OutputHandlerService) outputHandlerService: OutputHandlerService,
  ) {
    this.logger = logger;
    this.configuration = config;
    this.store = store;
    this.pipelineService = pipelineService;
    this.outputHandlerService = outputHandlerService;
  }

  public async init(): Promise<void> {
    return this.store.addQuadsFromFile(this.configuration.input);
  }

  public async run(): Promise<void> {
    const shaclStore = new QuadStore();
    const classIdToShapeIdMap = this.createSubjectToShapeIdMap(this.store.getClassIds(), false);
    const propertyIdToShapeIdMap = this.createSubjectToShapeIdMap(
      [...this.store.getDatatypePropertyIds(), ...this.store.getObjectPropertyIds()],
      this.configuration.mode === GenerationMode.Grouped ? true : false,
    );

    this.pipelineService.loadSubjectIdToShapeIdMaps(classIdToShapeIdMap, propertyIdToShapeIdMap);


    for (const classId of this.store.getClassIds()) {
      this.pipelineService.classPipeline.handle(classId, this.store, shaclStore);
    }

    for (const propertyId of [...this.store.getDatatypePropertyIds(), ...this.store.getObjectPropertyIds()]) {
      this.pipelineService.propertyPipeline.handle(propertyId, this.store, shaclStore);
    }

    this.outputHandlerService.write(shaclStore);
  }

  private createSubjectToShapeIdMap(subjects: RDF.NamedNode[], createBlankNodes: boolean): Map<string, NamedOrBlankNode> {
    const subjectToShapeIdMap: Map<string, NamedOrBlankNode> = new Map();
    const df: DataFactory = new DataFactory();

    for (const subject of subjects) {
      const label = getApplicationProfileLabel(subject, this.store, this.configuration.language);

      if (!label) {
        throw new Error(`Unable to find a label for subject "${subject.value}".`);
      }

      let shapeId: NamedOrBlankNode;
      if (createBlankNodes) {
        shapeId = df.blankNode();
      } else {
        const subjectType = this.store.findObject(subject, ns.rdf('type'))!;
        const suffix = subjectType.equals(ns.owl('Class')) ? 'Shape' : 'Property';
        shapeId = df.namedNode(`${this.configuration.shapeBaseURI}${toPascalCase(label.value)}${suffix}`)
      }

      subjectToShapeIdMap.set(subject.value, shapeId);
    }

    return subjectToShapeIdMap;
  }
}