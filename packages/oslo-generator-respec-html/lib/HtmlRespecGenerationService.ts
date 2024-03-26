import { writeFile, mkdir } from 'fs/promises';
import { resolve, dirname } from 'path';
import type { IService } from '@oslo-flanders/core';
import { ns, Logger, fetchFileOrUrl, QuadStore, ServiceIdentifier, getApplicationProfileLabel, getVocabularyLabel, getApplicationProfileDefinition, getVocabularyDefinition, getApplicationProfileUsageNote, getVocabularyUsageNote } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';
import { inject, injectable } from 'inversify';
import * as nj from 'nunjucks';
import {
  HtmlRespecGenerationServiceConfiguration,
} from '@oslo-generator-respec-html/config/HtmlRespecGenerationServiceConfiguration';
import { alphabeticalSort } from '@oslo-generator-respec-html/utils/alphabeticalSort';
import { isInScope, isScoped } from '@oslo-generator-respec-html/utils/scopeFilter';
import { SpecificationType } from '@oslo-generator-respec-html/utils/specificationTypeEnum';
import { Entity } from '@oslo-generator-respec-html/types/Entity';
import type { Stakeholder, StakeholdersDocument } from '@oslo-flanders/stakeholders-converter/lib/types/StakeholdersDocument';
import { SKOS_CONCEPT } from '@oslo-generator-respec-html/utils/skosConstants';

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
    const env = nj.configure(resolve(`${__dirname}/templates`));
    env.addFilter('json', function (value, spacing) {
      return JSON.stringify(value, null, spacing);
    });
    env.addFilter('getAnchorTag', (value) => {
      return this.getAnchorTag(value);
    });
    await this.store.addQuadsFromFile(this.configuration.input);
  }

  public async run(): Promise<void> {
    const [attributes, datatypes, config] = await Promise.all([
      this.extractPropertyInformation(),
      this.extractDatatypesInformation(),
      this.createRespecConfig(),
    ]);

    const indexPath = this.configuration.specificationType === SpecificationType.Vocabulary ?
      'vocabulary/index.njk' :
      'application-profile/index.njk';

    let data: Entity = {};
    if (this.configuration.specificationType === SpecificationType.ApplicationProfile) {
      // this.groupPropertiesPerDomain(classes, attributes);
      data = {
        classes: await this.extractClassInformation(isInScope),
        datatypes,
      };
    } else {
      data.classes = await this.extractClassInformation(isScoped);
      data.properties = attributes;
    }

    const html = nj.render(indexPath, {
      specName: this.configuration.specificationName,
      respecConfig: config,
      data,
    });

    const dirPath = dirname(this.configuration.output);
    await mkdir(dirPath, { recursive: true });

    await writeFile(this.configuration.output, html);
  }

  // helper methods
  private getAnchorTag(c: Entity) {
    return `${c.label}`
      .toLowerCase().replace(/[ .]/g, '-')
      .replace(/\(/g, '')
      .replace(/\)/g, '');
  }

  private fetchLabel(subjectId: RDF.Term) {
    return this.configuration.specificationType === SpecificationType.ApplicationProfile ?
      getApplicationProfileLabel(subjectId, this.store, this.configuration.language) : getVocabularyLabel(subjectId, this.store, this.configuration.language);
  }

  private fetchDefinition(subjectId: RDF.Term) {
    return this.configuration.specificationType === SpecificationType.ApplicationProfile ?
      getApplicationProfileDefinition(subjectId, this.store, this.configuration.language) : getVocabularyDefinition(subjectId, this.store, this.configuration.language);
  }

  private fetchUsageNote(subjectId: RDF.Term) {
    return this.configuration.specificationType === SpecificationType.ApplicationProfile ?
      getApplicationProfileUsageNote(subjectId, this.store, this.configuration.language) : getVocabularyUsageNote(subjectId, this.store, this.configuration.language);
  }

  private getPropertyInformation(subjectId: RDF.Term) {
    const assignedUri = this.store.getAssignedUri(subjectId);
    const minCount = this.store.getMinCardinality(subjectId);
    const maxCount = this.store.getMaxCardinality(subjectId);
    let codelist = this.store.getCodelist(subjectId);

    const label = this.fetchLabel(subjectId);
    const definition = this.fetchDefinition(subjectId);
    const usageNote = this.fetchUsageNote(subjectId);

    const domain = this.store.getDomain(subjectId);
    if (!domain) {
      throw new Error(`Unable to find the domain of subject ${subjectId.value}.`);
    }
    const domainAssignedUri = this.store.getAssignedUri(domain);

    const range = this.store.getRange(subjectId);
    if (!range) {
      throw new Error(`Unable to find the range for subject ${subjectId.value}.`);
    }

    const rangeAssignedUri = this.store.getAssignedUri(range);

    // If the range is an external scope, we need to fetch the codelist from the range
    if (rangeAssignedUri?.value === SKOS_CONCEPT && !codelist?.value) {
      codelist = this.store.getCodelist(range);
    }

    if (!rangeAssignedUri) {
      this.logger.error(`Unable to find the assigned URI of range (${range.value}) of attribute ${subjectId.value}.`);
    }
    const type = this.fetchLabel(range);

    if (!type) {
      this.logger.error(`Unable to find the label of range (${range.value}) of attribute ${subjectId.value}.`);
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
      type: type?.value,
      codelist: codelist?.value
    };
  }

  private async createRespecConfig(): Promise<any> {
    const { editors, authors } = await this.fetchStakeholders();
    const respecConfig = {
      specStatus: 'unofficial',
      shortName: this.configuration.specificationName,
      editors: editors?.map(editor => this.convertStakeholder(editor)) ?? [],
      authors: authors?.map(author => this.convertStakeholder(author)) ?? [],
      publishDate: new Date().toISOString(),
    };

    return `${JSON.stringify(respecConfig)}`;
  }

  private convertStakeholder(stakeholder: Stakeholder): { name: string } {
    return {
      name: `${stakeholder.firstName} ${stakeholder.lastName}`
    };
  }

  private createJsonDocument(authors: Stakeholder[], contributors: Stakeholder[], editors: Stakeholder[]): StakeholdersDocument {
    const doc: StakeholdersDocument = {};
    doc.contributors = contributors;
    doc.authors = authors;
    doc.editors = editors;
    return doc;
  }

  private async fetchStakeholders(): Promise<StakeholdersDocument> {
    const data = await fetchFileOrUrl(this.configuration.stakeholders);
    const { authors, contributors, editors } = JSON.parse(data.toString());
    return this.createJsonDocument(authors, contributors, editors);
  }

  private groupPropertiesPerDomain(classes: Entity[], properties: Entity[]): void {
    properties.forEach(property => {
      const classObject = classes.find(x => x.id === property.domain);

      if (!classObject) {
        this.logger.error(`Unable to find a related class object for domain ${property.domain} of property ${property.assignedUri}.`);
        return;
      }

      if (!classObject.properties) {
        classObject.properties = [];
      }

      classObject.properties.push(property);
    });
  }

  private extractEntityInformation(subjectId: RDF.Term) {
    const assignedUri = this.store.getAssignedUri(subjectId);
    const parents = this.store.getParentsOfClass(subjectId);
    const codelist = this.store.getCodelist(subjectId);

    const label = this.fetchLabel(subjectId);
    const definition = this.fetchDefinition(subjectId);
    const usageNote = this.fetchUsageNote(subjectId);

    const parentAssignedUris: string[] = [];
    parents.forEach(parent => {
      let parentAssignedUri = this.store.getAssignedUri(parent);

      if (!parentAssignedUri) {
        this.logger.error(`Unable to find the assigned URI of parent (${parent.value}) of class ${subjectId.value}.`);
      } else {
        parentAssignedUris.push(parentAssignedUri.value);
      }
    });

    const properties = this.store.findSubjects(ns.rdfs('domain'), subjectId).map((property: RDF.Term) => {
      return this.getPropertyInformation(property);
    });

    return {
      id: assignedUri?.value,
      label: label?.value,
      definition: definition?.value,
      usageNote: usageNote?.value,
      parents: parentAssignedUris,
      codelist: codelist?.value,
      properties: properties,
    };
  }

  private async extractClassInformation(filterFunction: (subject: RDF.NamedNode, store: QuadStore) => RDF.NamedNode | null): Promise<Entity[]> {
    return this.store.findSubjects(ns.rdf('type'), ns.owl('Class'))
      .filter(x => filterFunction(<RDF.NamedNode>x, this.store))
      .map(subjectId => this.extractEntityInformation(subjectId))
      .sort(alphabeticalSort);
  }

  private async extractDatatypesInformation(): Promise<Entity[]> {
    return this.store.findSubjects(ns.rdf('type'), ns.rdfs('Datatype'))
      .filter(x => isScoped(<RDF.NamedNode>x, this.store))
      .map(subjectId => this.extractEntityInformation(subjectId))
      .sort(alphabeticalSort);
  }

  private async extractPropertyInformation(): Promise<Entity[]> {
    return [
      ...this.store.findSubjects(ns.rdf('type'), ns.owl('DatatypeProperty')),
      ...this.store.findSubjects(ns.rdf('type'), ns.owl('ObjectProperty')),
    ]
      .filter(x => isInScope(<RDF.NamedNode>x, this.store))
      .map(subjectId => this.getPropertyInformation(subjectId))
      .sort(alphabeticalSort);
  }
}
