import {
  IService,
  Logger,
  QuadStore,
  getApplicationProfileLabel,
  ns,
} from '@oslo-flanders/core';
import { ShaclTemplateGenerationServiceConfiguration } from './config/ShaclTemplateGenerationServiceConfiguration';
import { inject, injectable } from 'inversify';
import type * as RDF from '@rdfjs/types';
import { NamedOrBlankNode } from './types/IHandler';
import { DataFactory } from 'rdf-data-factory';
import { PipelineService } from './PipelineService';
import { ShaclTemplateGenerationServiceIdentifier } from './config/ShaclTemplateGenerationServiceIdentifier';
import { OutputHandlerService } from './OutputHandlerService';
import { GenerationMode } from './enums/GenerationMode';
import { toPascalCase } from './utils/utils';
import { SHA1 } from 'crypto-js';

@injectable()
export class ShaclTemplateGenerationService implements IService {
  public readonly logger: Logger;
  public readonly configuration: ShaclTemplateGenerationServiceConfiguration;
  public readonly store: QuadStore;
  private readonly pipelineService: PipelineService;
  private readonly outputHandlerService: OutputHandlerService;

  public constructor(
    @inject(ShaclTemplateGenerationServiceIdentifier.Logger) logger: Logger,
    @inject(ShaclTemplateGenerationServiceIdentifier.Configuration)
    config: ShaclTemplateGenerationServiceConfiguration,
    @inject(ShaclTemplateGenerationServiceIdentifier.QuadStore)
    store: QuadStore,
    @inject(ShaclTemplateGenerationServiceIdentifier.PipelineService)
    pipelineService: PipelineService,
    @inject(ShaclTemplateGenerationServiceIdentifier.OutputHandlerService)
    outputHandlerService: OutputHandlerService,
  ) {
    this.logger = logger;
    this.configuration = config;
    this.store = store;
    this.pipelineService = pipelineService;
    this.outputHandlerService = outputHandlerService;
  }

  public async init(): Promise<void> {
    this.pipelineService.createPipelines(this.configuration);
    return this.store.addQuadsFromFile(this.configuration.input);
  }

  public async run(): Promise<void> {
    const shaclStore = new QuadStore();
    const classIdToShapeIdMap = this.createSubjectToShapeIdMap(
      [...this.store.getClassIds(), ...this.store.getDatatypes()],
      false,
    );
    const propertyIdToShapeIdMap = this.createSubjectToShapeIdMap(
      [
        ...this.store.getDatatypePropertyIds(),
        ...this.store.getObjectPropertyIds(),
      ],
      this.configuration.mode === GenerationMode.Grouped ? true : false,
    );

    this.pipelineService.loadSubjectIdToShapeIdMaps(
      classIdToShapeIdMap,
      propertyIdToShapeIdMap,
    );

    for (const classId of [
      ...this.store.getClassIds(),
      ...this.store.getDatatypes(),
    ]) {
      this.pipelineService.classPipeline.handle(
        classId,
        this.store,
        shaclStore,
      );
    }

    for (const propertyId of [
      ...this.store.getDatatypePropertyIds(),
      ...this.store.getObjectPropertyIds(),
    ]) {
      this.pipelineService.propertyPipeline.handle(
        propertyId,
        this.store,
        shaclStore,
      );
    }

    this.outputHandlerService.write(shaclStore);
  }

  private generateFragmentIdentifier(
    domainLabel: RDF.Literal,
    label: RDF.Literal,
    suffix: string,
  ): string {
    const fragmentIdentifier = `${toPascalCase(domainLabel.value)}.${toPascalCase(label.value)}${suffix}`;

    // Create SHA-1 hash from the fragment identifier
    const sha1Hash = SHA1(fragmentIdentifier)?.toString();

    return sha1Hash;
  }

  private createSubjectToShapeIdMap(
    subjects: RDF.NamedNode[],
    createBlankNodes: boolean,
  ): Map<string, NamedOrBlankNode> {
    const subjectToShapeIdMap: Map<string, NamedOrBlankNode> = new Map();
    const df: DataFactory = new DataFactory();

    for (const subject of subjects) {
      const label = getApplicationProfileLabel(
        subject,
        this.store,
        this.configuration.language,
      );

      if (!label) {
        throw new Error(
          `Unable to find a label for subject "${subject.value}".`,
        );
      }

      let shapeId: NamedOrBlankNode;
      if (createBlankNodes) {
        shapeId = df.blankNode();
      } else {
        const subjectType = this.store.findObject(subject, ns.rdf('type'))!;
        const suffix =
          subjectType.equals(ns.owl('Class')) ||
          subjectType.equals(ns.rdfs('Datatype'))
            ? 'Shape'
            : 'Property';

        let fragmentIdentifier = '';
        if (
          subjectType.equals(ns.owl('Class')) ||
          subjectType.equals(ns.rdfs('Datatype'))
        ) {
          fragmentIdentifier = `${toPascalCase(label.value)}${suffix}`;
        } else {
          const domain = this.store.getDomain(subject);

          if (!domain) {
            throw new Error(
              `Unable to find the domain for subject "${subject.value}".`,
            );
          }

          const domainLabel = getApplicationProfileLabel(
            domain,
            this.store,
            this.configuration.language,
          );

          if (!domainLabel) {
            throw new Error(
              `Unable to find the label for domain "${domain.value}".`,
            );
          }
          fragmentIdentifier = this.generateFragmentIdentifier(
            domainLabel,
            label,
            suffix,
          );
        }

        shapeId = df.namedNode(
          `${this.configuration.shapeBaseURI}${fragmentIdentifier}`,
        );
      }

      subjectToShapeIdMap.set(subject.value, shapeId);
    }

    return subjectToShapeIdMap;
  }
}
