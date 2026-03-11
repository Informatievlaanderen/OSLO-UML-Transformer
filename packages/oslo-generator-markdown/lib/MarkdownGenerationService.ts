/* eslint-disable eslint-comments/disable-enable-pair */

import * as path from 'path';
import * as md from 'ts-markdown-builder';
import { getMaxCount, IService } from '@oslo-flanders/core';
import {
  QuadStore,
  ns,
  Logger,
  ServiceIdentifier,
  getApplicationProfileLabel,
  getMinCount,
  ensureOutputDirectory,
  toPascalCase,
  toCamelCase,
  findAllAttributes
} from '@oslo-flanders/core';
import { writeFileSync } from 'fs';
import type * as RDF from '@rdfjs/types';
import { inject, injectable } from 'inversify';
import { DataFactory } from 'rdf-data-factory';
import { splitUri } from './utils/sparqlUtils';
import { MarkdownGenerationServiceConfiguration } from './config/MarkdownGenerationServiceConfiguration';
import { Generator as SparqlGenerator } from 'sparqljs';

@injectable()
export class MarkdownGenerationService implements IService {
  public readonly logger: Logger;
  public readonly configuration: MarkdownGenerationServiceConfiguration;
  public readonly dataFactory = new DataFactory();
  public readonly store: QuadStore;

  public constructor(
    @inject(ServiceIdentifier.Logger) logger: Logger,
    @inject(ServiceIdentifier.Configuration)
    config: MarkdownGenerationServiceConfiguration,
    @inject(ServiceIdentifier.QuadStore) store: QuadStore
  ) {
    this.logger = logger;
    this.configuration = config;
    this.store = store;
  }

  public async init(): Promise<void> {
    return this.store.addQuadsFromFile(this.configuration.input);
  }

  public async run(): Promise<void> {
    /* Create simple markdown tables for each entity. */
    const entities: Array<Entity> = await this.createMarkdownTables();

    /* Write output to file */
    await this.writeMarkdown(entities);
  }

  private async createMarkdownTables(): Promise<Array<Entity>> {

    const entities = new Array<Entity>();

    /* Create a query for each class and datatype in the diagram */
    for (const quad of [
      ...this.store.findQuads(null, ns.rdf('type'), ns.owl('Class')),
      ...this.store.findQuads(null, ns.rdf('type'), ns.rdfs('Datatype'))
    ]) {
      const classId = quad.subject;
      let label = getApplicationProfileLabel(
        classId,
        this.store,
        this.configuration.language
      )?.value;
      const assignedUri = this.store.getAssignedUri(classId)?.value;

      if (!label) {
        this.logger.error(
          `Unknown class label for subject ${classId.value}, cannot generate query`
        );
        continue;
      }
      /* Class labels should be always pascal cased */
      label = toPascalCase(label);

      console.log('========');
      console.log(`label: ${label} assignedUri: ${assignedUri}`);

      if (!assignedUri) {
        this.logger.error(
          `Unknown assigned URI for subject ${classId.value}, cannot generate query`
        );
        continue;
      }

      // create the entity we are traversing
      const entity = new Entity(label, assignedUri);
      entities.push(entity);

      /* Add all attributes of the class to the query */
      let attributeIds: RDF.Term[] = [];
      attributeIds = findAllAttributes(classId, attributeIds, this.store);

      /* Find all attributes for object */
      for (const attributeId of attributeIds) {
        let attributeLabel = getApplicationProfileLabel(
          attributeId,
          this.store,
          this.configuration.language
        )?.value;


        const attributeAssignedUri =
          this.store.getAssignedUri(attributeId)?.value;

        if (!attributeLabel) {
          this.logger.error(`Unknown label for attribute ${attributeId.value}`);
          continue;
        }
        /* Attribute labels should be always camel cased */
        attributeLabel = toCamelCase(attributeLabel);

        if (!attributeAssignedUri) {
          this.logger.error(
            `Unknown assigned URI for attribute ${attributeId.value}`
          );
          continue;
        }

        const range = this.store.getRange(attributeId);
        console.log('JOA range')
        console.log(range);
        let rangeUri = undefined
        let rangeLabel = undefined
        if(range) {
          rangeLabel = getApplicationProfileLabel(
            range,
            this.store,
            this.configuration.language
          )?.value;
          rangeUri = this.store.getAssignedUri(range)?.value

          // get the URI though...
          console.log('GETTING URI FOR RANGE')
          const rUri = this.store.getAssignedUri(range)
          console.log(rUri)
        }

        const splitted = await splitUri(attributeAssignedUri);

        const property = new Property(attributeLabel, attributeAssignedUri, splitted?.prefix, splitted?.element);
        entity.properties.push(property);

        /* Min count == 0 is reflected as SPARQL OPTIONAL in queries */
        const attributeMinCount = getMinCount(attributeId, this.store);
        const attributeMaxCount = getMaxCount(attributeId, this.store);

        property.minCount = attributeMinCount;
        property.maxCount = attributeMaxCount;

        property.rangeUri = rangeUri
        property.rangeLabel = rangeLabel

        if(rangeUri) {
          const rangeUriSplitted = await splitUri(rangeUri);
          property.rangePrefix = rangeUriSplitted?.prefix
          property.rangeElement = rangeUriSplitted?.element
        }
      }
    }

    // loop over extracted entities
    // console.log(entities);

    // sort everything to keep predictability
    entities.sort((a, b) => a.label.localeCompare(b.label));
    entities.forEach((e) => {
      e.properties.sort((a, b) => a.label.localeCompare(b.label));
    });

    return entities;
  }

  private async writeMarkdown(entities: Array<Entity>) {
    /* Create output directory */
    ensureOutputDirectory(this.configuration.output);

    /* Serialize entities and write them to a markdown file */
    var blocks: string[] = [];
    const headers = ['Eigenschap', 'URI', 'Type', 'Type URI', 'Kardinaliteit'];
    entities.forEach((e) => {
      blocks.push(md.heading(md.link(e.uri, e.label), { level: 2 }));
      let rows: string[][] = [];
      e.properties.forEach((p) => {
        rows.push([
          // the label
          p.label,
          // the uri (shortened, with link to full)
          md.link(p.uri, p.prettyUri()),
          // the range label
          p.rangeLabel!!,
          // the range uri
          md.link(p.rangeUri!!, p.prettyRangeUri()),
          `${p.minCount}..${p.maxCount}`
        ]);
      });
      blocks.push(md.table(headers, rows));
    });
    writeFileSync(path.join(this.configuration.output, `markdown.md`), md.joinBlocks(blocks));
  }
}

class Entity {
  label: string;
  uri: string;
  properties: Array<Property>;

  constructor(label: string, uri: string) {
    this.label = label;
    this.uri = uri;
    this.properties = new Array<Property>();
  }
}

class Property {
  label: string;
  uri: string;
  prefix: string | undefined;
  element: string | undefined;
  minCount: string | undefined;
  maxCount: string | undefined;
  rangeUri: string | undefined;
  rangeLabel: string | undefined;
  rangePrefix: string | undefined;
  rangeElement: string | undefined;

  constructor(label: string, uri: string, prefix: string | undefined, element: string | undefined) {
    this.label = label;
    this.uri = uri;
    this.prefix = prefix;
    this.element = element;
  }

  prettyUri() {
    return (this.prefix && this.element) ? `${this.prefix}:${this.element}` : this.uri
  }

  prettyRangeUri() {
    return (this.rangePrefix && this.rangeElement) ? `${this.rangePrefix}:${this.rangeElement}` : this.rangeUri
  }
}