import { writeFile, mkdir } from 'fs/promises';
import { resolve, dirname } from 'path';
import type { IService } from '@oslo-flanders/core';
import { ns, Logger, QuadStore, ServiceIdentifier } from '@oslo-flanders/core';

import type * as RDF from '@rdfjs/types';
import { inject, injectable } from 'inversify';
import * as nj from 'nunjucks';
import { HtmlRespecGenerationServiceConfiguration } from './config/HtmlRespecGenerationServiceConfiguration';
import { isInScope } from './utils/scopeFilter';

@injectable()
export class HtmlRespecGenerationService implements IService {
  public readonly logger: Logger;
  public readonly configuration: HtmlRespecGenerationServiceConfiguration;
  public readonly store: QuadStore;

  public constructor(
  @inject(ServiceIdentifier.Logger) logger: Logger,
    @inject(ServiceIdentifier.Configuration) config: HtmlRespecGenerationServiceConfiguration,
    @inject(ServiceIdentifier.QuadStore) store: QuadStore,
  ) {
    this.logger = logger;
    this.configuration = config;
    this.store = store;
  }

  public async init(): Promise<void> {
    nj.configure(resolve(`${__dirname}/templates`));
    await this.store.addQuadsFromFile(this.configuration.input);
  }

  // TODO: make a distinction between application profile and vocabulary
  public async run(): Promise<void> {
    const [classes, attributes, config] = await Promise.all([
      this.extractClassInformation(),
      this.extractPropertyInformation(),
      this.createRespecConfig(),
    ]);

    const html = nj.render('index.njk', {
      specName: '',
      respecConfig: config,
      classes,
      attributes,
    });

    const dirPath = dirname(this.configuration.output);
    await mkdir(dirPath, { recursive: true });

    await writeFile(this.configuration.output, html);
  }

  private async createRespecConfig(): Promise<any> {
    const respecConfig = {
      specStatus: 'ED',
      publishDate: new Date().toISOString(),
    };

    return `${JSON.stringify(respecConfig)}`;
  }

  private async extractClassInformation(): Promise<any[]> {
    return this.store.findSubjects(ns.rdf('type'), ns.owl('Class'))
      .filter(x => isInScope(<RDF.NamedNode>x, this.store))
      .map(subjectId => {
        const assignedUri = this.store.getAssignedUri(subjectId);
        const label = this.store.getLabel(subjectId, this.configuration.language);
        const definition = this.store.getDefinition(subjectId, this.configuration.language);
        const parents = this.store.getParentsOfClass(subjectId);

        const parentAssignedUris: RDF.NamedNode[] = [];
        parents.forEach(parent => {
          let parentAssignedUri = this.store.getAssignedUri(parent);

          if (!parentAssignedUri) {
            parentAssignedUri = this.store.getAssignedUriViaStatements(
              subjectId,
              ns.rdfs('subClassOf'),
              parent,
            );
          }

          if (!parentAssignedUri) {
            this.logger.error(`Unable to find the assigned URI of parent (${parent.value}) of class ${subjectId.value}.`);
          } else {
            parentAssignedUris.push(parentAssignedUri);
          }
        });

        return {
          id: assignedUri?.value,
          label: label?.value,
          definition: definition?.value,
          parents: parentAssignedUris,
        };
      });
  }

  private async extractPropertyInformation(): Promise<any[]> {
    return [
      ...this.store.findSubjects(ns.rdf('type'), ns.owl('DatatypeProperty')),
      ...this.store.findSubjects(ns.rdf('type'), ns.owl('ObjectProperty')),
    ]
      .filter(x => isInScope(<RDF.NamedNode>x, this.store))
      .map(subjectId => {
        const assignedUri = this.store.getAssignedUri(subjectId);
        const label = this.store.getLabel(subjectId, this.configuration.language);
        const definition = this.store.getDefinition(subjectId, this.configuration.language);
        const minCount = this.store.getMinCardinality(subjectId);
        const maxCount = this.store.getMaxCardinality(subjectId);
        const usageNote = this.store.getUsageNote(subjectId, this.configuration.language);

        const domain = this.store.getDomain(subjectId);
        if (!domain) {
          throw new Error(`Unable to find the domain of subject ${subjectId.value}.`);
        }
        const domainAssignedUri = this.store.getAssignedUri(domain);

        const range = this.store.getRange(subjectId);
        if (!range) {
          throw new Error(`Unable to find the range for subject ${subjectId.value}.`);
        }

        let rangeAssignedUri = this.store.getAssignedUri(range);
        if (!rangeAssignedUri) {
          rangeAssignedUri = this.store.getAssignedUriViaStatements(subjectId, ns.rdfs('range'), range);
        }

        if (!rangeAssignedUri) {
          this.logger.error(`Unable to find the assigned URI of range (${range.value}) of attribute ${subjectId.value}.`);
        }

        return {
          id: assignedUri?.value,
          label: label?.value,
          definition: definition?.value,
          minCount: minCount?.value,
          maxCount: maxCount?.value,
          usageNote: usageNote?.value,
          domain: domainAssignedUri?.value,
          range: rangeAssignedUri?.value,
        };
      });
  }
}
