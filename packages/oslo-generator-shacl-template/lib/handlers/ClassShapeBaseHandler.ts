import type { Logger, QuadStore } from '@oslo-flanders/core';
import { ns } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';
import { ShaclHandler }
  from "../types/IHandler";
import { inject } from 'inversify';
import { TranslationService } from '../TranslationService';
import { ShaclTemplateGenerationServiceConfiguration } from '../config/ShaclTemplateGenerationServiceConfiguration';
import { ShaclTemplateGenerationServiceIdentifier } from '../config/ShaclTemplateGenerationServiceIdentifier';

export class ClassShapeBaseHandler extends ShaclHandler {
  public constructor(
    @inject(ShaclTemplateGenerationServiceIdentifier.Configuration) config: ShaclTemplateGenerationServiceConfiguration,
    @inject(ShaclTemplateGenerationServiceIdentifier.Logger) logger: Logger,
    @inject(ShaclTemplateGenerationServiceIdentifier.TranslationService) translationService: TranslationService,
  ) {
    super(config, logger, translationService);
  }

  public handle(
    subject: RDF.NamedNode,
    store: QuadStore,
    shaclStore: QuadStore,
  ): void {
    const assignedURI = store.getAssignedUri(subject);

    if (!assignedURI) {
      throw new Error(`Unable to find the assigned URI for subject "${subject.value}".`);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const shapeId = this.classIdToShapeIdMap.get(subject.value)!;

    shaclStore.addQuads([
      this.df.quad(
        <RDF.NamedNode>shapeId,
        ns.rdf('type'),
        ns.shacl('NodeShape'),
      ),
      this.df.quad(
        <RDF.NamedNode>shapeId,
        ns.shacl('targetClass'),
        assignedURI,
      ),
      this.df.quad(
        <RDF.NamedNode>shapeId,
        ns.shacl('closed'),
        this.df.literal('false', ns.xsd('boolean')),
      ),
    ])

    super.handle(subject, store, shaclStore);
  }
}