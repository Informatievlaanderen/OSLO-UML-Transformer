import { ns } from '@oslo-flanders/core';

/* eslint-disable */
const Properties: Map<string, object> = new Map<string, object>([
  [ns.rdf('langString').value, { '@value': { type: 'string' }, '@language': { type: 'string', pattern: '^nl$' } }],
  [ns.rdfs('Literal').value, { '@value': { type: 'string' } }],
  [ns.xsd('string').value, { '@value': { type: 'string' } }],
  [ns.xsd('anyURI').value, { '@id': { type: 'string', format: 'uri' } }],
  [ns.xsd('dateTime').value, { '@value': { type: 'string', format: 'date-time' }, '@type': { type: 'string', pattern: '^DateTime$' } }],
  [ns.xsd('date').value, { '@value': { type: 'string', format: 'date' }, '@type': { type: 'string', pattern: '^Date$' } }],
  [ns.xsd('boolean').value, { '@value': { type: 'boolean' }, '@type': { type: 'string', pattern: '^Boolean$' } }],
  [ns.xsd('integer').value, { '@value': { type: 'number', format: 'int64' }, '@type': { type: 'string', pattern: '^Integer$' } }],
  [ns.xsd('long').value, { '@value': { type: 'number', format: 'int64', minimum: -9223372036854775808, maximum: 9223372036854775807 }, '@type': { type: 'string', pattern: '^Long$' } }],
  [ns.xsd('float').value, { '@value': { type: 'number', format: 'float' }, '@type': { type: 'string', pattern: '^Float$' } }],
  [ns.xsd('double').value, { '@value': { type: 'number', format: 'double' }, '@type': { type: 'string', pattern: '^Double$' } }],
  [ns.xsd('int').value, { '@value': { type: 'number', format: 'int32', minimum: -2147483648, maximum: 2147483647 }, '@type': { type: 'string', pattern: '^Int$' } }],
  [ns.xsd('short').value, { '@value': { type: 'number', format: 'int32', minimum: -32768, maximum: 32767 }, '@type': { type: 'string', pattern: '^Short$' } }],
  [ns.xsd('byte').value, { '@value': { type: 'number', format: 'int32', minimum: -128, maximum: 127 }, '@type': { type: 'string', pattern: '^Byte$' } }],
  [ns.xsd('hexBinary').value, { '@value': { type: 'string', format: 'binary' }, '@type': { type: 'string', pattern: '^HexBinary$' } }],
  [ns.xsd('base64Binary').value, { '@value': { type: 'string', format: 'byte' }, '@type': { type: 'string', pattern: '^Base64Binary$' } }],
  [ns.xsd('nonNegativeInteger').value, { '@value': { type: 'number', format: 'int64' }, '@type': { type: 'string', pattern: '^NonNegativeInteger$' } }],
  [ns.xsd('nonPositiveInteger').value, { '@value': { type: 'number', format: 'int64' }, '@type': { type: 'string', pattern: '^NonPositiveInteger$' } }],
  [ns.xsd('negativeInteger').value, { '@value': { type: 'number', format: 'int64', maximum: 0 }, '@type': { type: 'string', pattern: '^NegativeInteger$' } }],
  [ns.xsd('positiveInteger').value, { '@value': { type: 'number', format: 'int64', minimum: 1 }, '@type': { type: 'string', pattern: '^PositiveInteger$' } }],
  [ns.xsd('unsignedLong').value, { '@value': { type: 'number', format: 'int64', minimum: 0, maximum: 18446744073709551615 }, '@type': { type: 'string', pattern: '^UnsignedLong$' } }],
  [ns.xsd('unsignedInt').value, { '@value': { type: 'number', format: 'int32', minimum: 0, maximum: 4294967295 }, '@type': { type: 'string', pattern: '^UnsignedInt$' } }],
  [ns.xsd('unsignedShort').value, { '@value': { type: 'number', format: 'int32', minimum: 0, maximum: 65535 }, '@type': { type: 'string', pattern: '^UnsignedShort$' } }],
  [ns.xsd('unsignedByte').value, { '@value': { type: 'number', format: 'int32', minimum: 0, maximum: 255 }, '@type': { type: 'string', pattern: '^UnsignedByte$' } }],
  [ns.xsd('decimal').value, { '@value': { type: 'string', pattern: '(+|-)?([0-9]+(.[0-9]*)?|.[0-9]+)' }, '@type': { type: 'string', pattern: '^Decimal$' } }],
]);
/* eslint-enable */
 
export const mapProperties = (
    datatype: string,
    label: string,
    baseURI: string,
    subclasses: string[],
    abstract: boolean,
  ): object => {
  /* Primitive data type conversion from Linked Data to Swagger */
  if (Properties.has(datatype)) {
    return Properties.get(datatype)!; // W: Forbidden non-null assertion.
  }

  /* Multiple subclasses requires a discriminator to link both the superclass and subclasses as schemas */
  if (subclasses.length > 1) {
    const mapping: Record<string, string> = {};
    const oneOf = [];

    /* Only allow super class if it is not abstract */
    if (!abstract) {
      mapping[label] = `#/components/schemas/${label}`;
      oneOf.push({ $ref: `#/components/schemas/${label}` });
    }

    for (const subclass of subclasses) {
      const ref = `#/components/schemas/${subclass}`;
      oneOf.push({ $ref: ref });
      mapping[subclass] = ref;
    }

    return {
      oneOf,
      discriminator: {
        propertyName: '@type',
        mapping,
      },
    };
  }

  /* Regular schemas without any subclassing */
  return {
    $ref: `#/components/schemas/${label}`,
  };
};
