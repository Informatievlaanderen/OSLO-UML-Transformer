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
  DataTypes,
} from '@oslo-flanders/core';
import * as path from 'path';
import { writeFile } from 'fs/promises';
import type * as RDF from '@rdfjs/types';
import { inject, injectable } from 'inversify';
import { SwaggerGenerationServiceConfiguration } from './config/SwaggerGenerationServiceConfiguration';
import type {
  SwaggerRoot,
  SwaggerSchema,
  SwaggerLink,
  ResolvedAttribute,
} from './types/Swagger';
import { mapProperties } from './enums/Properties';
import {
  buildErrorResponses,
  buildProbleemDetailsSchema,
  filterLinksByClass,
  getContact,
  getLicense,
} from './utils/swaggerUtils';

@injectable()
export class SwaggerGenerationService implements IService {
  public readonly logger: Logger;
  public readonly configuration: SwaggerGenerationServiceConfiguration;
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

  public async init(): Promise<void> {
    return this.store.addQuadsFromFile(this.configuration.input);
  }

  public async run(): Promise<void> {
    const schemas = this.createSchemas();
    const links = this.createLinks();

    for (const [label, schema] of Object.entries(schemas)) {
      await this.writeJSON(schema, `swagger/components/schemas/${label}.json`);
    }

    for (const [label, link] of Object.entries(links)) {
      await this.writeJSON(link, `swagger/components/links/${label}.json`);
    }

    const components = this.buildComponentsDocument(schemas, links);
    await this.writeJSON(components, 'swagger/components.json');

    const swagger = this.createSwagger(schemas, links);
    await this.writeJSON(swagger, 'swagger/example.json');
  }

  private buildInfoBlock(title: string) {
    return {
      title,
      description: this.configuration.description,
      contact: getContact(
        this.configuration.contactName,
        this.configuration.contactURL,
        this.configuration.contactEmail,
      ),
      license: getLicense(
        this.configuration.licenseName,
        this.configuration.licenseURL,
      ),
      version: this.configuration.versionAPI,
    };
  }

  private resolveAttribute(attributeId: RDF.Term): ResolvedAttribute | null {
    let attributeLabel = getApplicationProfileLabel(
      attributeId,
      this.store,
      this.configuration.language,
    )?.value;

    if (!attributeLabel) {
      this.logger.error(`Unknown label for attribute ${attributeId.value}`);
      return null;
    }
    attributeLabel = toCamelCase(attributeLabel);

    const attributeRangeId = this.store.getRange(attributeId);
    if (!attributeRangeId) {
      this.logger.error(`Unknown range for attribute ${attributeId.value}`);
      return null;
    }

    const attributeDomainId = this.store.getDomain(attributeId);
    if (!attributeDomainId) {
      this.logger.error(`Unknown domain for attribute ${attributeId.value}`);
      return null;
    }

    const attributeDatatypeId =
      this.store.getAssignedUri(attributeRangeId)?.value;
    let attributeDatatypeLabel = getApplicationProfileLabel(
      attributeRangeId,
      this.store,
      this.configuration.language,
    )?.value;

    if (!attributeDatatypeId || !attributeDatatypeLabel) {
      this.logger.error(`Unknown datatype for attribute ${attributeId.value}`);
      return null;
    }
    attributeDatatypeLabel = toPascalCase(attributeDatatypeLabel);

    const attributeClassLabel = getApplicationProfileLabel(
      attributeDomainId,
      this.store,
      this.configuration.language,
    )?.value;

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

    const attributeMinCount = getMinCount(attributeId, this.store);
    const attributeMaxCount = getMaxCount(attributeId, this.store);

    if (!attributeMinCount || !attributeMaxCount) {
      this.logger.error(
        `Unknown cardinality for attribute ${attributeId.value}`,
      );
      return null;
    }

    const subclasses: string[] = [];
    for (const subclassId of this.store.findSubjects(
      ns.rdfs('subClassOf'),
      attributeRangeId,
    )) {
      const subclassLabel = getApplicationProfileLabel(
        subclassId,
        this.store,
        this.configuration.language,
      )?.value;

      if (!subclassLabel) {
        this.logger.error(`Unable to retrieve subclass label of ${subclassId}`);
        continue;
      }
      subclasses.push(subclassLabel);
    }

    return {
      attributeLabel,
      attributeDefinition,
      attributeUsageNote,
      attributeMinCount,
      attributeMaxCount,
      attributeDatatypeId,
      attributeDatatypeLabel,
      attributeClassLabel,
      subclasses,
    };
  }

  private getClassLabel(classId: RDF.Term): string | null {
    const label = getApplicationProfileLabel(
      classId,
      this.store,
      this.configuration.language,
    )?.value;

    if (!label) {
      this.logger.error(`Unknown class label for ${classId.value}`);
      return null;
    }
    return toPascalCase(label);
  }

  public createSchemas(): Record<string, SwaggerSchema> {
    const schemas: Record<string, SwaggerSchema> = {};

    schemas['ProbleemDetails'] = buildProbleemDetailsSchema();

    this.addEnumerationSchemas(schemas);
    this.addClassAndDatatypeSchemas(schemas);

    return schemas;
  }

  private addEnumerationSchemas(schemas: Record<string, SwaggerSchema>): void {
    for (const enumId of this.store.findSubjects(
      ns.oslo('assignedURI'),
      ns.skos('Concept'),
    )) {
      const label = this.getClassLabel(enumId);
      if (!label) continue;

      schemas[label] = {
        title: label,
        type: 'object',
        description: `Enumeratie van ${label}`,
        properties: {
          '@id': { type: 'string', format: 'uri' },
        },
        required: ['@id'],
      };
    }
  }

  private addClassAndDatatypeSchemas(
    schemas: Record<string, SwaggerSchema>,
  ): void {
    const classAndDatatypeIds = [
      ...this.store.findSubjects(ns.rdf('type'), ns.owl('Class')),
      ...this.store.findSubjects(ns.rdf('type'), ns.rdfs('Datatype')),
    ];

    for (const classId of classAndDatatypeIds) {
      const assignedUri = this.store.getAssignedUri(classId);
      if (assignedUri && [...DataTypes.values()].includes(assignedUri.value)) {
        continue;
      }

      const label = this.getClassLabel(classId);
      if (!label) continue;

      const definition = getApplicationProfileDefinition(
        classId,
        this.store,
        this.configuration.language,
      )?.value;

      const attributeIds = findAllAttributes(classId, [], this.store, this.logger);
      const { properties, required } =
        this.buildAttributeProperties(attributeIds);

      schemas[label] = {
        title: label,
        type: 'object',
        description: definition,
        properties: {
          '@id': { type: 'string', format: 'uri' },
          '@type': {
            type: 'object',
            description: `Object type (klasse ${label})`,
            pattern: `^${label}$`,
          },
          ...properties,
        },
        required: ['@id', '@type', ...required],
      };

      /* Create JSON-LD envelope variant */
      const jsonLdSchema = JSON.parse(
        JSON.stringify(schemas[label]),
      ) as SwaggerSchema;
      jsonLdSchema.required = [...(jsonLdSchema.required ?? []), '@context'];
      jsonLdSchema.properties!['@context'] = {
        type: 'string',
        format: 'uri',
        pattern: `^${this.configuration.contextURL}$`.replace(/\//g, '\\/'),
      };
      schemas[`${label}JsonLd`] = jsonLdSchema;
    }
  }

  private buildAttributeProperties(attributeIds: RDF.Term[]): {
    properties: Record<string, unknown>;
    required: string[];
  } {
    const properties: Record<string, unknown> = {};
    const required: string[] = [];

    for (const attributeId of attributeIds) {
      const resolved = this.resolveAttribute(attributeId);
      if (!resolved) continue;

      const {
        attributeLabel,
        attributeDefinition,
        attributeUsageNote,
        attributeMinCount,
        attributeMaxCount,
        attributeDatatypeId,
        attributeDatatypeLabel,
        subclasses,
      } = resolved;

      const description = [attributeDefinition, attributeUsageNote]
        .filter(Boolean)
        .join(' ');

      const mappedProps = mapProperties(
        attributeDatatypeId,
        attributeDatatypeLabel,
        this.configuration.baseURL,
        subclasses,
      );

      const isPrimitive = [...DataTypes.values()].includes(attributeDatatypeId);
      const item = isPrimitive
        ? {
            type: 'object',
            description,
            properties: mappedProps,
            required: mappedProps ? Object.keys(mappedProps) : undefined,
          }
        : mappedProps;

      const isArray = attributeMaxCount !== '0' && attributeMaxCount !== '1';

      if (isArray) {
        properties[attributeLabel] = {
          type: 'array',
          description: `Lijst van ${attributeDatatypeLabel} items.`,
          items: item,
          minItems: parseInt(attributeMinCount, 10),
          maxItems:
            attributeMaxCount === '*'
              ? undefined
              : parseInt(attributeMaxCount, 10),
        };
      } else {
        properties[attributeLabel] = item;
      }

      if (attributeMinCount === '1') {
        required.push(attributeLabel);
      }
    }

    return { properties, required: [...new Set(required)] };
  }

  public createLinks(): Record<string, SwaggerLink> {
    const links: Record<string, SwaggerLink> = {};

    for (const classId of this.store.findSubjects(
      ns.rdf('type'),
      ns.owl('Class'),
    )) {
      const label = this.getClassLabel(classId);
      if (!label) continue;

      const attributeIds = findAllAttributes(classId, [], this.store, this.logger);

      for (const attributeId of attributeIds) {
        const resolved = this.resolveAttribute(attributeId);
        if (!resolved) continue;

        const { attributeLabel, attributeDatatypeId, attributeDatatypeLabel } =
          resolved;

        if (!isStandardDatatype(attributeDatatypeId)) {
          links[`${label}.${attributeLabel}`] = {
            operationId: `${label}GET`,
            parameters: {
              id: `$response.body#/${label}.${attributeLabel}/@id`,
            },
            description: `De waarde van het attribuut \`@id\` kan gebruikt worden om het gerefereerde object van het type \`${attributeDatatypeLabel}\` op te halen.`,
          };
        }
      }
    }

    return links;
  }

  public createSwagger(
    schemas: Record<string, SwaggerSchema>,
    links: Record<string, SwaggerLink>,
  ): SwaggerRoot {
    const swagger: SwaggerRoot = {
      Swagger: this.configuration.versionSwagger,
      info: this.buildInfoBlock(this.configuration.title),
      servers: [{ url: this.configuration.baseURL, description: 'Basis URL' }],
      paths: {},
      components: { schemas: { ...schemas } },
    };

    for (const classId of this.store.findSubjects(
      ns.rdf('type'),
      ns.owl('Class'),
    )) {
      const label = this.getClassLabel(classId);
      if (!label) continue;

      const definition = getApplicationProfileDefinition(
        classId,
        this.store,
        this.configuration.language,
      )?.value;

      const usageNote = getApplicationProfileUsageNote(
        classId,
        this.store,
        this.configuration.language,
      )?.value;

      const filteredLinks = filterLinksByClass(links, label);

      swagger.paths[`/id/${label}/{id}`] = {
        get: {
          summary: definition,
          description: usageNote,
          operationId: `${label}GET`,
          parameters: [
            {
              name: 'id',
              required: true,
              in: 'path',
              description: `Identificator van een ${label} object.`,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: {
              description: `${label} object gevonden.`,
              content: {
                [OutputFormat.JsonLd]: {
                  schema: { $ref: `#/components/schemas/${label}` },
                },
              },
              links: filteredLinks,
            },
            ...buildErrorResponses(label),
          },
        },
      };
    }

    return swagger;
  }

  private buildComponentsDocument(
    schemas: Record<string, SwaggerSchema>,
    links: Record<string, SwaggerLink>,
  ) {
    return {
      openapi: this.configuration.versionSwagger,
      info: this.buildInfoBlock(`Components of ${this.configuration.title}`),
      components: { schemas, links },
    };
  }

  public async writeJSON(data: unknown, outputPath: string): Promise<void> {
    const json = JSON.stringify(data, null, 2);
    const filePath = path.join(this.configuration.output, outputPath);

    ensureOutputDirectory(path.dirname(filePath));
    await writeFile(filePath, json);
  }
}
