import type { IService } from '@oslo-flanders/core';
import {
  QuadStore,
  ns,
  Logger,
  ServiceIdentifier,
  isStandardDatatype,
  getApplicationProfileLabel,
  getApplicationProfileDefinition,
  getApplicationProfileUsageNote,
  getMinCount,
  getMaxCount,
  OutputFormat,
  ensureOutputDirectory,
  findAllAttributes,
  toPascalCase,
  toCamelCase,
} from '@oslo-flanders/core';
import * as path from 'path';
import { writeFile } from 'fs/promises';
import type * as RDF from '@rdfjs/types';
import { inject, injectable } from 'inversify';
import { DataFactory } from 'rdf-data-factory';
import { SwaggerGenerationServiceConfiguration } from './config/SwaggerGenerationServiceConfiguration';
import {
  SwaggerRoot,
  SwaggerInfoContact,
  SwaggerInfoLicense,
} from './types/Swagger';
import { mapProperties } from './enums/Properties';

@injectable()
export class SwaggerGenerationService implements IService {
  public readonly logger: Logger;
  public readonly configuration: SwaggerGenerationServiceConfiguration;
  public readonly dataFactory = new DataFactory();
  public readonly store: QuadStore;

  public constructor(
    @inject(ServiceIdentifier.Logger) logger: Logger,
    @inject(ServiceIdentifier.Configuration)
    config: SwaggerGenerationServiceConfiguration,
    @inject(ServiceIdentifier.QuadStore) store: QuadStore,
  ) {
    this.logger = logger;
    this.configuration = config;
    this.store = store;
  }

  private getContact(): SwaggerInfoContact | undefined {
    /* If no contact information is provided, the whole block may not appear */
    if (
      !this.configuration.contactName &&
      !this.configuration.contactURL &&
      !this.configuration.contactEmail
    )
      return undefined;

    return {
      name: this.configuration.contactName,
      url: this.configuration.contactURL,
      email: this.configuration.contactEmail,
    };
  }

  private getLicense(): SwaggerInfoLicense | undefined {
    /* If no license information is provided, the whole block may not appear */
    if (!this.configuration.licenseName && !this.configuration.licenseURL)
      return undefined;

    return {
      name: this.configuration.licenseName,
      url: this.configuration.licenseURL,
    };
  }

  private getTag(subject: RDF.Term): string {
    if (
      this.store
        .getAssignedUri(subject)
        ?.value.startsWith(this.configuration.baseURL)
    ) {
      return 'OSLO datastandaarden';
    }

    return 'Externe datastandaarden';
  }

  public async init(): Promise<void> {
    return this.store.addQuadsFromFile(this.configuration.input);
  }

  public async run(): Promise<void> {
    /* Create Swagger schemas */
    const schemas: any = this.createSchemas();
    for (const label of Object.keys(schemas))
      await this.writeJSON(
        schemas[label],
        `swagger/components/schemas/${label}.json`,
      );

    /* Create Swagger links */
    const links: any = this.createLinks();
    for (const label of Object.keys(links))
      await this.writeJSON(
        links[label],
        `swagger/components/links/${label}.json`,
      );

    /* Create Swagger endpoint paths as example */
    const swagger = this.createSwagger(schemas, links);
    await this.writeJSON(swagger, 'swagger/example.json');
  }

  public createSwagger(schemas: any, links: any): Object {
    const swagger: SwaggerRoot = {
      openapi: this.configuration.versionSwagger,
      info: {
        title: this.configuration.title,
        description: this.configuration.description,
        contact: this.getContact(),
        license: this.getLicense(),
        version: this.configuration.versionAPI,
      },
      servers: [
        {
          url: this.configuration.baseURL,
          description: 'Basis URL',
        },
      ],
      paths: {},
    };

    /* Create endpoint for each Class */
    for (const classId of this.store.findSubjects(
      ns.rdf('type'),
      ns.owl('Class'),
    )) {
      let label = getApplicationProfileLabel(
        classId,
        this.store,
        this.configuration.language,
      )?.value;
      const definition = getApplicationProfileDefinition(
        classId,
        this.store,
        this.configuration.language,
      )?.value;
      const usageNote = getApplicationProfileDefinition(
        classId,
        this.store,
        this.configuration.language,
      )?.value;
      let attributes: any = {};
      let requiredAttributes: any = {};

      /* Get all attributes in a recursive manner for inheritance */
      let attributeIds: RDF.Term[] = [];
      attributeIds = findAllAttributes(classId, attributeIds, this.store);

      if (!label) {
        this.logger.error(`Unknown class label for ${classId.value}`);
        continue;
      }
      /* Class labels should be always pascal cased */
      label = toPascalCase(label);

      attributes[label] = [];
      requiredAttributes[label] = [];

      /* Find all attributes for object */
      for (const attributeId of attributeIds) {
        let attributeLabel = getApplicationProfileLabel(
          attributeId,
          this.store,
          this.configuration.language,
        )?.value;
        const attributeMinCount = getMinCount(attributeId, this.store);
        const attributeMaxCount = getMaxCount(attributeId, this.store);
        const attributeRangeId = this.store.getRange(attributeId);
        const attributeDefinition = getApplicationProfileDefinition(
          attributeId,
          this.store,
          this.configuration.language,
        )?.value;
        const attributeUsageNote = getApplicationProfileUsageNote(
          attributeId,
          this.store,
          this.configuration.language,
        )?.value;

        if (!attributeLabel) {
          this.logger.error(`Unknown label for attribute ${attributeId.value}`);
          continue;
        }
        /* Attribute labels should be always camel cased */
        attributeLabel = toCamelCase(attributeLabel);

        if (!attributeRangeId) {
          this.logger.error(`Unknown range for attribute ${attributeId.value}`);
          continue;
        }

        const attributeDatatypeId =
          this.store.getAssignedUri(attributeRangeId)?.value;
        let attributeDatatypeLabel = getApplicationProfileLabel(
          attributeRangeId,
          this.store,
          this.configuration.language,
        )?.value;

        if (!attributeDatatypeId || !attributeDatatypeLabel) {
          this.logger.error(
            `Unknown datatype for attribute ${attributeId.value}`,
          );
          continue;
        }
        attributeDatatypeLabel = toPascalCase(attributeDatatypeLabel);

        if (!attributeMinCount || !attributeMaxCount) {
          this.logger.error(
            `Unknown cardinality for attribute ${attributeId.value}`,
          );
          continue;
        }

        /* Arrays must be introduced into the schema if the max cardinality is 2 or more */
        const type = 'object';
        const description = `${attributeDefinition}${attributeUsageNote ? ' ' + attributeUsageNote : ''}`;
        const properties = mapProperties(
          attributeDatatypeId,
          attributeDatatypeLabel,
          this.configuration.baseURL,
        );
        const requiredProperties = properties
          ? Object.keys(properties)
          : undefined;

        if (attributeMaxCount != '0' && attributeMaxCount != '1') {
          attributes[label][`${label}.${attributeLabel}`] = {
            type: 'array',
            description: `Lijst van ${attributeDatatypeLabel} items.`,
            items: {
              type: type,
              description: description,
              properties: properties,
              required: requiredProperties,
            },
            minItems: parseInt(attributeMinCount),
            maxItems:
              attributeMaxCount == '*'
                ? undefined
                : parseInt(attributeMaxCount),
          };
          /* Regular property with a cardinality of [0..0], [0..1], [1..1] */
        } else {
          attributes[label][`${label}.${attributeLabel}`] = {
            type: type,
            description: description,
            properties: properties,
            required: requiredProperties,
          };
        }

        /* Only require properties which are not arrays since those have their own cardinality checks */
        if (attributeMinCount == '1')
          requiredAttributes[label].push(`${label}.${attributeLabel}`);
      }

      const filteredLinks: any = {};
      for (const key of Object.keys(links)) {
        if (key.startsWith(`${label}.`)) filteredLinks[key] = links[key];
      }

      /* Create an endpoint for each object to have PURIs for each object */
      swagger.paths[`/id/${label}/{id}`] = {
        get: {
          summary: definition,
          description: usageNote,
          operationId: `${label}GET`,
          tags: [this.getTag(classId)],
          parameters: [
            {
              name: 'id',
              required: true,
              in: 'path',
              description: `Identificator van een ${label} object.`,
              schema: {
                type: 'string',
              },
            },
          ],
          responses: {
            200: {
              description: `${label} object gevonden.`,
              content: {
                [OutputFormat.JsonLd]: {
                  schema: {
                    $ref: `${this.configuration.baseURL}swagger/components/schemas/${label}.json`,
                  },
                },
              },
              links: filteredLinks,
            },
            400: {
              description: `Ontbrekende informatie bij het opvragen een ${label} object.`,
            },
            404: {
              description: `${label} object met gegeven ID niet gevonden.`,
            },
          },
        },
      };
    }

    return swagger;
  }

  public createSchemas(): Object {
    const schemas: { [key: string]: any } = {};

    /* Create schema for each Class and Datatype */
    let links: any = {};
    for (const classId of [
      ...this.store.findSubjects(ns.rdf('type'), ns.owl('Class')),
      ...this.store.findSubjects(ns.rdf('type'), ns.rdfs('Datatype')),
    ]) {
      let label = getApplicationProfileLabel(
        classId,
        this.store,
        this.configuration.language,
      )?.value;
      const definition = getApplicationProfileDefinition(
        classId,
        this.store,
        this.configuration.language,
      )?.value;
      let attributes: any = {};
      let requiredAttributes: any = {};

      /* Get all attributes in a recursive manner for inheritance */
      let attributeIds: RDF.Term[] = [];
      attributeIds = findAllAttributes(classId, attributeIds, this.store);

      if (!label) {
        this.logger.error(`Unknown class label for ${classId.value}`);
        continue;
      }
      /* Class labels should be always pascal cased */
      label = toPascalCase(label);

      attributes[label] = [];
      requiredAttributes[label] = [];

      /* Find all attributes for object */
      for (const attributeId of attributeIds) {
        let attributeLabel = getApplicationProfileLabel(
          attributeId,
          this.store,
          this.configuration.language,
        )?.value;
        const attributeMinCount = getMinCount(attributeId, this.store);
        const attributeMaxCount = getMaxCount(attributeId, this.store);
        const attributeRangeId = this.store.getRange(attributeId);
        const attributeDefinition = getApplicationProfileDefinition(
          attributeId,
          this.store,
          this.configuration.language,
        )?.value;
        const attributeUsageNote = getApplicationProfileUsageNote(
          attributeId,
          this.store,
          this.configuration.language,
        )?.value;

        if (!attributeLabel) {
          this.logger.error(`Unknown label for attribute ${attributeId.value}`);
          continue;
        }
        /* Attribute labels should be always camel cased */
        attributeLabel = toCamelCase(attributeLabel);

        if (!attributeRangeId) {
          this.logger.error(`Unknown range for attribute ${attributeId.value}`);
          continue;
        }

        const attributeDatatypeId =
          this.store.getAssignedUri(attributeRangeId)?.value;
        let attributeDatatypeLabel = getApplicationProfileLabel(
          attributeRangeId,
          this.store,
          this.configuration.language,
        )?.value;

        if (!attributeDatatypeId || !attributeDatatypeLabel) {
          this.logger.error(
            `Unknown datatype for attribute ${attributeId.value}`,
          );
          continue;
        }
        attributeDatatypeLabel = toPascalCase(attributeDatatypeLabel);

        if (!attributeMinCount || !attributeMaxCount) {
          this.logger.error(
            `Unknown cardinality for attribute ${attributeId.value}`,
          );
          continue;
        }

        /* Arrays must be introduced into the schema if the max cardinality is 2 or more */
        const type = 'object';
        const description = `${attributeDefinition}${attributeUsageNote ? ' ' + attributeUsageNote : ''}`;
        const properties = mapProperties(
          attributeDatatypeId,
          attributeDatatypeLabel,
          this.configuration.baseURL,
        );
        const requiredProperties = properties
          ? Object.keys(properties)
          : undefined;

        if (attributeMaxCount != '0' && attributeMaxCount != '1') {
          attributes[label][`${label}.${attributeLabel}`] = {
            type: 'array',
            description: `Lijst van ${attributeDatatypeLabel} items.`,
            items: {
              type: type,
              description: description,
              properties: properties,
              required: requiredProperties,
            },
            minItems: parseInt(attributeMinCount),
            maxItems:
              attributeMaxCount == '*'
                ? undefined
                : parseInt(attributeMaxCount),
          };
          /* Regular property with a cardinality of [0..0], [0..1], [1..1] */
        } else {
          attributes[label][`${label}.${attributeLabel}`] = {
            type: type,
            description: description,
            properties: properties,
            required: requiredProperties,
          };
        }

        /* Only require properties which are not arrays since those have their own cardinality checks */
        if (attributeMinCount == '1')
          requiredAttributes[label].push(`${label}.${attributeLabel}`);
      }

      /* Create components for each schema */
      schemas[label] = {
        title: label,
        type: 'object',
        description: definition,
        properties: {
          '@context': {
            type: 'string',
            format: 'uri',
            enum: [this.configuration.contextURL],
          },
          '@id': {
            type: 'string',
            format: 'uri',
          },
          '@type': {
            type: 'array',
            description: 'Lijst van object types (klasse)',
            items: {
              type: 'string',
              description: `${label} type`,
              /* enum validation breaks codegen, see https://vlaamseoverheid.atlassian.net/browse/DATAST-46 */
            },
            minItems: 1,
          },
          ...attributes[label],
        },
        required: ['@context', '@id', '@type', ...requiredAttributes[label]],
      };
    }

    return schemas;
  }

  public createLinks(): Object {
    let links: any = {};

    /* Create link for each Class, datatypes are always nested. */
    for (const classId of this.store.findSubjects(
      ns.rdf('type'),
      ns.owl('Class'),
    )) {
      let label = getApplicationProfileLabel(
        classId,
        this.store,
        this.configuration.language,
      )?.value;

      /* Get all attributes in a recursive manner for inheritance */
      let attributeIds: RDF.Term[] = [];
      attributeIds = findAllAttributes(classId, attributeIds, this.store);

      if (!label) {
        this.logger.error(`Unknown class label for ${classId.value}`);
        continue;
      }
      /* Class labels should be always pascal cased */
      label = toPascalCase(label);

      /* Find all attributes for object */
      for (const attributeId of attributeIds) {
        let attributeLabel = getApplicationProfileLabel(
          attributeId,
          this.store,
          this.configuration.language,
        )?.value;
        const attributeRangeId = this.store.getRange(attributeId);
        const attributeDefinition = getApplicationProfileDefinition(
          attributeId,
          this.store,
          this.configuration.language,
        )?.value;

        if (!attributeLabel) {
          this.logger.error(`Unknown label for attribute ${attributeId.value}`);
          continue;
        }
        /* Attribute labels should be always camel cased */
        attributeLabel = toCamelCase(attributeLabel);

        if (!attributeRangeId) {
          this.logger.error(`Unknown range for attribute ${attributeId.value}`);
          continue;
        }

        const attributeDatatypeId =
          this.store.getAssignedUri(attributeRangeId)?.value;
        let attributeDatatypeLabel = getApplicationProfileLabel(
          attributeRangeId,
          this.store,
          this.configuration.language,
        )?.value;

        if (!attributeDatatypeId || !attributeDatatypeLabel) {
          this.logger.error(
            `Unknown datatype for attribute ${attributeId.value}`,
          );
          continue;
        }
        attributeDatatypeLabel = toPascalCase(attributeDatatypeLabel);

        /* Create all possible links for endpoint */
        if (!isStandardDatatype(attributeDatatypeId)) {
          links[`${label}.${attributeLabel}`] = {
            operationId: `${label}GET`,
            parameters: {
              /* Referring to response body always starts with the same prefix */
              id: `$response.body#/${label}.${attributeLabel}/@id`,
            },
            description: `De waarde van het attribuut \`@id\` kan gebruikt worden om het gerefereerde object van het type \`${attributeDatatypeLabel}\` op te halen.`,
          };
        }
      }
    }

    return links;
  }

  public async writeJSON(json: Object, outputPath: string) {
    const data = JSON.stringify(json, null, 2);
    const filePath = path.join(this.configuration.output, outputPath);

    ensureOutputDirectory(path.dirname(filePath));
    await writeFile(filePath, data);
  }
}
