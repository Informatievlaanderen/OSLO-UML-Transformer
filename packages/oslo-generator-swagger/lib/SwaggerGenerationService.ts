/* eslint-disable eslint-comments/disable-enable-pair */

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
} from '@oslo-flanders/core';
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
import { findAllAttributes } from './utils/swaggerUtils';

/* Regex for escaping URIs when using patterns in OpenAPI JSON */
const RE_DOT = /\./gi;
const RE_SLASH = /\//gi;

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
        ?.value.startsWith('https://data.vlaanderen.be/')
    ) {
      return 'OSLO datastandaarden';
    }

    return 'Externe datastandaarden';
  }

  public async init(): Promise<void> {
    return this.store.addQuadsFromFile(this.configuration.input);
  }

  public async run(): Promise<void> {
    /* Create Swagger as JSON */
    const swagger = this.createSwagger();

    /* Write Swagger to file */
    await this.writeSwagger(swagger);
  }

  public createSwagger(): Object {
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
      components: {
        schemas: {},
      },
    };

    /* Create endpoint for each Class */
    let links: any = {};
    for (const s of this.store.findSubjects(ns.rdf('type'), ns.owl('Class'))) {
      let label = getApplicationProfileLabel(
        s,
        this.store,
        this.configuration.language,
      )?.value;
      let definition = getApplicationProfileDefinition(
        s,
        this.store,
        this.configuration.language,
      )?.value;
      let usageNote = getApplicationProfileDefinition(
        s,
        this.store,
        this.configuration.language,
      )?.value;
      let attributes: any = {};
      let requiredAttributes: any = {};

      /* Get all attributes in a recursive manner for inheritance */
      let attributeIds: RDF.Term[] = [];
      attributeIds = findAllAttributes(s, attributeIds, this.store);

      if (!label) {
        this.logger.error(`Unknown class label for ${s.value}`);
        continue;
      }

      attributes[label] = [];
      requiredAttributes[label] = [];
      links[label] = {};

      /* Find all attributes for object */
      for (const a of attributeIds) {
        const attributeMinCount = getMinCount(a, this.store);
        const attributeMaxCount = getMaxCount(a, this.store);
        const attributeLabel = getApplicationProfileLabel(
          a,
          this.store,
          this.configuration.language,
        )?.value;
        const attributeRangeId = this.store.getRange(a);
        const attributeDefinition = getApplicationProfileDefinition(
          a,
          this.store,
          this.configuration.language,
        )?.value;
        const attributeUsageNote = getApplicationProfileUsageNote(
          a,
          this.store,
          this.configuration.language,
        )?.value;

        if (!attributeLabel) {
          this.logger.error(`Unknown label for attribute ${a.value}`);
          continue;
        }

        if (!attributeRangeId) {
          this.logger.error(`Unknown range for attribute ${a.value}`);
          continue;
        }

        const attributeDatatypeId =
          this.store.getAssignedUri(attributeRangeId)?.value;
        const attributeDatatypeLabel = getApplicationProfileLabel(
          attributeRangeId,
          this.store,
          this.configuration.language,
        )?.value;

        if (!attributeDatatypeId || !attributeDatatypeLabel) {
          this.logger.error(`Unknown datatype for attribute ${a.value}`);
          continue;
        }

        if (!attributeMinCount || !attributeMaxCount) {
          this.logger.error(`Unknown cardinality for attribute ${a.value}`);
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

        /* Create all possible links for endpoint */
        if (!isStandardDatatype(attributeDatatypeId)) {
          links[label][`${attributeDatatypeLabel}GET`] = {
            operationId: `${attributeDatatypeLabel}GET`,
            parameters: {
              /* Referring to response body always starts with the same prefix */
              id: `$response.body#/${label}.${attributeLabel}/@id`,
            },
            description: `Het \`@id\` attribuut van de waarde van \`${label}.${attributeLabel}\` kan gebruikt worden om het gerefereerde object van het type \`${attributeDatatypeLabel}\` op te halen.`,
          };
        }
      }

      /* Create an endpoint for each object to have PURIs for each object */
      swagger.paths[`/id/${label}/{id}`] = {
        get: {
          summary: definition,
          description: usageNote,
          operationId: `${label}GET`,
          tags: [this.getTag(s)],
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
                'application/ld+json': {
                  schema: {
                    $ref: `#/components/schemas/${label}`,
                  },
                },
              },
              links: links[label],
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

      /* Create components for each schema */
      swagger.components.schemas[label] = {
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
            pattern: `^${this.configuration.baseURL.replace(RE_SLASH, '\\/').replace(RE_DOT, '\\.')}id\\/${label}\\/\\d`,
          },
          '@type': {
            type: 'string',
            description: 'Object type (klasse)',
            enum: [label],
          },
          ...attributes[label],
        },
        required: ['@context', '@id', '@type', ...requiredAttributes[label]],
      };
    }

    return swagger;
  }

  public async writeSwagger(swagger: Object) {
    const data = JSON.stringify(swagger, null, 2);

    await writeFile(this.configuration.output, data);
  }
}
