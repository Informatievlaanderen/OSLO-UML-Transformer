import { ns } from '@oslo-flanders/core';
import type {
  DiscriminatorSchema,
  JsonLdPrimitiveSchema,
  MappedPropertyResult,
  SchemaRef,
} from '../types/Swagger';

/**
 * Maps XSD/RDF primitive data types to their JSON-LD / OpenAPI schema representations.
 */
const PRIMITIVE_TYPE_MAP: ReadonlyMap<string, JsonLdPrimitiveSchema> = new Map([
  [
    ns.rdf('langString').value,
    {
      '@value': { type: 'string' },
      '@language': { type: 'string', pattern: '^nl$' },
    },
  ],
  [
    ns.rdfs('Literal').value,
    {
      '@value': { type: 'string' },
    },
  ],
  [
    ns.xsd('string').value,
    {
      '@value': { type: 'string' },
    },
  ],
  [
    ns.xsd('anyURI').value,
    {
      '@id': { type: 'string', format: 'uri' },
    },
  ],
  [
    ns.xsd('dateTime').value,
    {
      '@value': { type: 'string', format: 'date-time' },
      '@type': { type: 'string', pattern: '^DateTime$' },
    },
  ],
  [
    ns.xsd('date').value,
    {
      '@value': { type: 'string', format: 'date' },
      '@type': { type: 'string', pattern: '^Date$' },
    },
  ],
  [
    ns.xsd('boolean').value,
    {
      '@value': { type: 'boolean' },
      '@type': { type: 'string', pattern: '^Boolean$' },
    },
  ],
  [
    ns.xsd('integer').value,
    {
      '@value': { type: 'number', format: 'int64' },
      '@type': { type: 'string', pattern: '^Integer$' },
    },
  ],
  [
    ns.xsd('long').value,
    {
      '@value': {
        type: 'number',
        format: 'int64',
        minimum: -9_223_372_036_854_775_808,
        maximum: 9_223_372_036_854_775_807,
      },
      '@type': { type: 'string', pattern: '^Long$' },
    },
  ],
  [
    ns.xsd('float').value,
    {
      '@value': { type: 'number', format: 'float' },
      '@type': { type: 'string', pattern: '^Float$' },
    },
  ],
  [
    ns.xsd('double').value,
    {
      '@value': { type: 'number', format: 'double' },
      '@type': { type: 'string', pattern: '^Double$' },
    },
  ],
  [
    ns.xsd('int').value,
    {
      '@value': {
        type: 'number',
        format: 'int32',
        minimum: -2_147_483_648,
        maximum: 2_147_483_647,
      },
      '@type': { type: 'string', pattern: '^Int$' },
    },
  ],
  [
    ns.xsd('short').value,
    {
      '@value': {
        type: 'number',
        format: 'int32',
        minimum: -32_768,
        maximum: 32_767,
      },
      '@type': { type: 'string', pattern: '^Short$' },
    },
  ],
  [
    ns.xsd('byte').value,
    {
      '@value': {
        type: 'number',
        format: 'int32',
        minimum: -128,
        maximum: 127,
      },
      '@type': { type: 'string', pattern: '^Byte$' },
    },
  ],
  [
    ns.xsd('hexBinary').value,
    {
      '@value': { type: 'string', format: 'binary' },
      '@type': { type: 'string', pattern: '^HexBinary$' },
    },
  ],
  [
    ns.xsd('base64Binary').value,
    {
      '@value': { type: 'string', format: 'byte' },
      '@type': { type: 'string', pattern: '^Base64Binary$' },
    },
  ],
  [
    ns.xsd('nonNegativeInteger').value,
    {
      '@value': { type: 'number', format: 'int64' },
      '@type': { type: 'string', pattern: '^NonNegativeInteger$' },
    },
  ],
  [
    ns.xsd('nonPositiveInteger').value,
    {
      '@value': { type: 'number', format: 'int64' },
      '@type': { type: 'string', pattern: '^NonPositiveInteger$' },
    },
  ],
  [
    ns.xsd('negativeInteger').value,
    {
      '@value': { type: 'number', format: 'int64', maximum: 0 },
      '@type': { type: 'string', pattern: '^NegativeInteger$' },
    },
  ],
  [
    ns.xsd('positiveInteger').value,
    {
      '@value': { type: 'number', format: 'int64', minimum: 1 },
      '@type': { type: 'string', pattern: '^PositiveInteger$' },
    },
  ],
  [
    ns.xsd('unsignedLong').value,
    {
      '@value': {
        type: 'number',
        format: 'int64',
        minimum: 0,
        maximum: 18_446_744_073_709_551_615,
      },
      '@type': { type: 'string', pattern: '^UnsignedLong$' },
    },
  ],
  [
    ns.xsd('unsignedInt').value,
    {
      '@value': {
        type: 'number',
        format: 'int32',
        minimum: 0,
        maximum: 4_294_967_295,
      },
      '@type': { type: 'string', pattern: '^UnsignedInt$' },
    },
  ],
  [
    ns.xsd('unsignedShort').value,
    {
      '@value': {
        type: 'number',
        format: 'int32',
        minimum: 0,
        maximum: 65_535,
      },
      '@type': { type: 'string', pattern: '^UnsignedShort$' },
    },
  ],
  [
    ns.xsd('unsignedByte').value,
    {
      '@value': { type: 'number', format: 'int32', minimum: 0, maximum: 255 },
      '@type': { type: 'string', pattern: '^UnsignedByte$' },
    },
  ],
  [
    ns.xsd('decimal').value,
    {
      '@value': { type: 'string', pattern: '(+|-)?([0-9]+(.[0-9]*)?|.[0-9]+)' },
      '@type': { type: 'string', pattern: '^Decimal$' },
    },
  ],
]);

function createSchemaRef(name: string): SchemaRef {
  return { $ref: `#/components/schemas/${name}` };
}

function buildDiscriminatorSchema(
  label: string,
  subclasses: string[],
): DiscriminatorSchema {
  const mapping: Record<string, string> = {};
  const oneOf: SchemaRef[] = [];

  const allTypes = [label, ...subclasses];
  for (const type of allTypes) {
    const ref = createSchemaRef(type);
    oneOf.push(ref);
    mapping[type] = ref.$ref;
  }

  return {
    oneOf,
    discriminator: {
      propertyName: '@type',
      mapping,
    },
  };
}

/**
 * Maps a datatype to its OpenAPI schema representation.
 */
export function mapProperties(
  datatype: string,
  label: string,
  _baseURI: string,
  subclasses: string[],
): MappedPropertyResult {
  const primitiveSchema = PRIMITIVE_TYPE_MAP.get(datatype);
  if (primitiveSchema) {
    return primitiveSchema;
  }

  if (subclasses.length > 1) {
    return buildDiscriminatorSchema(label, subclasses);
  }

  return createSchemaRef(label);
}
