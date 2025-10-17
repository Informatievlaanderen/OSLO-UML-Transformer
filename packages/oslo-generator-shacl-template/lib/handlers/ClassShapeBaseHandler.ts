import {
  getApplicationProfileLabel,
  getApplicationProfileDefinition,
  getApplicationProfileUsageNote,
  type Logger,
  type QuadStore,
} from '@oslo-flanders/core';
import { ns } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';
import { ShaclHandler } from '../types/IHandler';
import { inject } from 'inversify';
import { TranslationService } from '../TranslationService';
import { ShaclTemplateGenerationServiceConfiguration } from '../config/ShaclTemplateGenerationServiceConfiguration';
import { ShaclTemplateGenerationServiceIdentifier } from '../config/ShaclTemplateGenerationServiceIdentifier';
import { shouldFilterUri } from '../constants/filteredUris';

export class ClassShapeBaseHandler extends ShaclHandler {
  public constructor(
    @inject(ShaclTemplateGenerationServiceIdentifier.Configuration)
    config: ShaclTemplateGenerationServiceConfiguration,
    @inject(ShaclTemplateGenerationServiceIdentifier.Logger) logger: Logger,
    @inject(ShaclTemplateGenerationServiceIdentifier.TranslationService)
    translationService: TranslationService,
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
      throw new Error(
        `Unable to find the assigned URI for subject "${subject.value}".`,
      );
    }

    // Skip generating a NodeShape for filtered URIs
    // https://github.com/Informatievlaanderen/OSLO-UML-Transformer/issues/191
    if (shouldFilterUri(assignedURI)) {
      return;
    }

    const label: RDF.Literal | undefined = getApplicationProfileLabel(
      subject,
      store,
      this.config.language,
    );

    if (!label) {
      throw new Error(
        `Unable to find the label for subject "${subject.value}".`,
      );
    }

    const description: RDF.Literal | undefined =
      getApplicationProfileDefinition(subject, store, this.config.language);

    if (!description) {
      this.logger.warn(
        `Unable to find the description for subject "${subject.value}".`,
      );
    }

    const usageNote: RDF.Literal | undefined = getApplicationProfileUsageNote(
      subject,
      store,
      this.config.language,
    );

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
      this.df.quad(<RDF.NamedNode>shapeId, ns.rdfs('label'), label),
      ...(description
        ? [this.df.quad(shapeId, ns.rdfs('comment'), description)]
        : []),
      ...(usageNote
        ? [this.df.quad(shapeId, ns.vann('usageNote'), usageNote)]
        : []),
    ]);

    super.handle(subject, store, shaclStore);
  }
}
