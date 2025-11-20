import {
  IService,
  Logger,
  QuadStore,
  getApplicationProfileLabel,
  createList,
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
import { shouldFilterUri } from './constants/filteredUris';

@injectable()
export class ShaclTemplateGenerationService implements IService {
  public readonly logger: Logger;
  public readonly configuration: ShaclTemplateGenerationServiceConfiguration;
  public readonly store: QuadStore;
  private readonly pipelineService: PipelineService;
  private readonly outputHandlerService: OutputHandlerService;
  private readonly df: DataFactory;

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
    this.df = new DataFactory();
  }

  public async init(): Promise<void> {
    this.pipelineService.createPipelines(this.configuration);
    return this.store.addQuadsFromFile(this.configuration.input);
  }

  public async run(): Promise<void> {
    const shaclStore = new QuadStore();

    // Filter out rdfs:Literal from datatypes before creating shape maps
    // https://github.com/Informatievlaanderen/OSLO-UML-Transformer/issues/191
    const datatypes = [...this.store.getDatatypes()].filter((datatype) => {
      const assignedURI = this.store.getAssignedUri(datatype);
      return !assignedURI || !shouldFilterUri(assignedURI);
    });

    const classIdToShapeIdMap = this.createSubjectToShapeIdMap(
      [...this.store.getClassIds(), ...datatypes],
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

    // Add container shape with rdfs:member links if enabled
    // https://vlaamseoverheid.atlassian.net/browse/SDTT-370
    if (this.configuration.addShapesContainer) {
      this.addShapesContainerToStore(
        shaclStore,
        classIdToShapeIdMap,
        propertyIdToShapeIdMap,
      );
    }

    // Adjust SHACL to honor redefines and subsets of properties
    this.handleRedefinedProperties(
      this.store,
      shaclStore,
      classIdToShapeIdMap,
      propertyIdToShapeIdMap,
    );

    this.outputHandlerService.write(shaclStore);
  }

  private addShapesContainerToStore(
    shaclStore: QuadStore,
    classIdToShapeIdMap: Map<string, NamedOrBlankNode>,
    propertyIdToShapeIdMap: Map<string, NamedOrBlankNode>,
  ): void {
    const containerShapeId = this.df.namedNode(
      `${this.configuration.shapeBaseURI}`,
    );

    // Add rdfs:member links to all class shapes (non-blank nodes only)
    for (const [, shapeId] of classIdToShapeIdMap) {
      if (shapeId.termType === 'NamedNode') {
        shaclStore.addQuad(
          this.df.quad(containerShapeId, ns.rdfs('member'), shapeId),
        );
      }
    }

    // Add rdfs:member links to all property shapes. Currently disabled. CAn be activated if property shapes should be added to the container as well.
    // if (this.configuration.mode !== GenerationMode.Grouped) {
    //   for (const [, shapeId] of propertyIdToShapeIdMap) {
    //     if (shapeId.termType === 'NamedNode') {
    //       shaclStore.addQuad(
    //         df.quad(containerShapeId, ns.rdfs('member'), shapeId),
    //       );
    //     }
    //   }
    // }
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
        shapeId = this.df.blankNode();
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

        shapeId = this.df.namedNode(
          `${this.configuration.shapeBaseURI}${fragmentIdentifier}`,
        );
      }

      subjectToShapeIdMap.set(subject.value, shapeId);
    }

    return subjectToShapeIdMap;
  }

  private handleRedefinedProperties(
    store: QuadStore,
    shaclStore: QuadStore,
    classIdToShapeIdMap: Map<string, NamedOrBlankNode>,
    propertyIdToShapeIdMap: Map<string, NamedOrBlankNode>,
  ) {
    /*
     * For each redefined property, extract the cross reference
     * in the UML diagram which has a parent and a child attribute.
     *
     * The parent attribute points to the property that is redefined
     * from the parent class by the child. The child attribute points
     * to the redefined property in the child.
     *
     * The parent class gets a SHACL xone property which allows the
     * parent to choose between the normal variant of the property
     * (for all other classes) and the redefined variant of the property
     * for this specific child. By enforcing that the redefined variant
     * only applies to the child through rdf:type, other subclasses
     * won't be affected.
     *
     * This redefined property is therefore removed from the list
     * of properties (SHACL property attribute) to avoid that it
     * is checked twice as this is already done in the SHACL xone.
     */
    for (const redefinedProperty of store.findSubjects(
      ns.rdf('type'),
      ns.oslo('RedefinedAttribute'),
    )) {
      const baseQuadsGraph = this.df.namedNode(`baseQuadsGraph`);
      const child: RDF.Term | undefined = store.findObject(
        redefinedProperty,
        ns.oslo('childAttribute'),
      );
      const parent: RDF.Term | undefined = store.findObject(
        redefinedProperty,
        ns.oslo('parentAttribute'),
      );

      if (!child || !parent)
        throw new Error('Child or parent is missing for cross reference!');

      const childDomain: RDF.Term | undefined = store.getDomain(child);
      const parentDomain: RDF.Term | undefined = store.getDomain(parent);

      if (!childDomain || !parentDomain)
        throw new Error('Child or parent domain is missing!');

      const childNodeShapeId: NamedOrBlankNode = classIdToShapeIdMap.get(
        childDomain.value,
      )!;
      const parentNodeShapeId: NamedOrBlankNode = classIdToShapeIdMap.get(
        parentDomain.value,
      )!;

      const propertyShapeParent: NamedOrBlankNode | undefined =
        propertyIdToShapeIdMap.get(parent.value);
      const propertyShapeChild: NamedOrBlankNode | undefined =
        propertyIdToShapeIdMap.get(child.value);

      if (!propertyShapeParent || !propertyShapeChild)
        throw new Error('Cannot find SHACL property shape for parent or child');

      /*
       * FIXME: figure out why the blanknode propertyShapeParent is not equal
       * to the one in the SHACL Store so we can just call removeQuad() directly.
       */
      for (const q of shaclStore.findQuads(
        parentNodeShapeId,
        ns.shacl('property'),
        null,
      )) {
        if (q.object.value === propertyShapeParent.value) {
          shaclStore.removeQuad(q);
          break;
        }
      }

      const rdfTypeShapeId = this.df.blankNode();
      const childClassId = shaclStore.findObject(
        childNodeShapeId,
        ns.shacl('targetClass'),
      );
      if (!childClassId) throw new Error('Cannot find child class ID');

      const xOneList = [this.df.blankNode(), this.df.blankNode()];
      const xOneValues = [
        /* rdf:type filter */
        this.df.quad(
          rdfTypeShapeId,
          ns.shacl('class'),
          childClassId as NamedOrBlankNode,
        ),
        this.df.quad(rdfTypeShapeId, ns.rdf('type'), ns.shacl('PropertyShape')),
        /* Parent: all targetClasses, except for the child, match not through rdf:type. */
        this.df.quad(xOneList[0], ns.shacl('property'), propertyShapeParent),
        this.df.quad(xOneList[0], ns.shacl('not'), rdfTypeShapeId),
        /* Child: only match with the child through rdf:type. */
        this.df.quad(xOneList[1], ns.shacl('property'), rdfTypeShapeId),
        this.df.quad(xOneList[1], ns.shacl('property'), propertyShapeChild)
      ];

      shaclStore.addQuads([
        this.df.quad(
          parentNodeShapeId,
          ns.shacl('xone'),
          createList(xOneList, shaclStore, this.df),
          baseQuadsGraph,
        ),
        ...xOneValues,
      ]);
    }
  }
}
