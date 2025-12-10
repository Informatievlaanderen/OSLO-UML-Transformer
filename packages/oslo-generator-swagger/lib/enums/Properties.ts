import { ns } from '@oslo-flanders/core';
import { RE_DOT, RE_SLASH } from '../constants/Swagger';

/* eslint-disable */
const Properties: Map<string, object> = new Map<string, object>([
  [ns.rdf('langString').value, { '@value': { type: 'string' }, '@language': { type: 'string', enum: ['nl'] } }],
  [ns.xsd('string').value, { '@value': { type: 'string' } }],
  [ns.xsd('anyURI').value, { '@id': { type: 'string', format: 'uri' } }],
  [ns.xsd('dateTime').value, { '@value': { type: 'string', format: 'date-time' }, '@type': { type: 'string', enum: ['DateTime'] } }],
  [ns.xsd('date').value, { '@value': { type: 'string', format: 'date' }, '@type': { type: 'string', enum: ['Date'] } }],
  [ns.xsd('boolean').value, { '@value': { type: 'boolean' }, '@type': { type: 'string', enum: ['Boolean'] } }],
  [ns.xsd('integer').value, { '@value': { type: 'number', format: 'int64' }, '@type': { type: 'string', enum: ['Integer'] } }],
  [ns.xsd('long').value, { '@value': { type: 'number', format: 'int64', minimum: -9223372036854775808, maximum: 9223372036854775807 }, '@type': { type: 'string', enum: ['Long'] } }],
  [ns.xsd('float').value, { '@value': { type: 'number', format: 'float' }, '@type': { type: 'string', enum: ['Float'] } }],
  [ns.xsd('double').value, { '@value': { type: 'number', format: 'double' }, '@type': { type: 'string', enum: ['Double'] } }],
  [ns.xsd('int').value, { '@value': { type: 'number', format: 'int32', minimum: -2147483648, maximum: 2147483647 }, '@type': { type: 'string', enum: ['Int'] } }],
  [ns.xsd('short').value, { '@value': { type: 'number', format: 'int32', minimum: -32768, maximum: 32767 }, '@type': { type: 'string', enum: ['Short'] } }],
  [ns.xsd('byte').value, { '@value': { type: 'number', format: 'int32', minimum: -128, maximum: 127 }, '@type': { type: 'string', enum: ['Byte'] } }],
  [ns.xsd('hexBinary').value, { '@value': { type: 'string', format: 'binary' }, '@type': { type: 'string', enum: ['HexBinary'] } }],
  [ns.xsd('base64Binary').value, { '@value': { type: 'string', format: 'byte' }, '@type': { type: 'string', enum: ['Base64Binary'] } }],
  [ns.xsd('nonNegativeInteger').value, { '@value': { type: 'number', format: 'int64' }, '@type': { type: 'string', enum: ['NonNegativeInteger'] } }],
  [ns.xsd('nonPositiveInteger').value, { '@value': { type: 'number', format: 'int64' }, '@type': { type: 'string', enum: ['NonPositiveInteger'] } }],
  [ns.xsd('negativeInteger').value, { '@value': { type: 'number', format: 'int64', maximum: 0 }, '@type': { type: 'string', enum: ['NegativeInteger'] } }],
  [ns.xsd('positiveInteger').value, { '@value': { type: 'number', format: 'int64', minimum: 1 }, '@type': { type: 'string', enum: ['PositiveInteger'] } }],
  [ns.xsd('unsignedLong').value, { '@value': { type: 'number', format: 'int64', minimum: 0, maximum: 18446744073709551615 }, '@type': { type: 'string', enum: ['UnsignedLong'] } }],
  [ns.xsd('unsignedInt').value, { '@value': { type: 'number', format: 'int32', minimum: 0, maximum: 4294967295 }, '@type': { type: 'string', enum: ['UnsignedInt'] } }],
  [ns.xsd('unsignedShort').value, { '@value': { type: 'number', format: 'int32', minimum: 0, maximum: 65535 }, '@type': { type: 'string', enum: ['UnsignedShort'] } }],
  [ns.xsd('unsignedByte').value, { '@value': { type: 'number', format: 'int32', minimum: 0, maximum: 255 }, '@type': { type: 'string', enum: ['UnsignedByte'] } }],
  [ns.xsd('decimal').value, { '@value': { type: 'string', pattern: '(+|-)?([0-9]+(.[0-9]*)?|.[0-9]+)' }, '@type': { type: 'string', enum: ['Decimal'] } }],
]);
/* eslint-enable */
 
export const mapProperties = (datatype: string, label: string, baseURI: string): object => {
  if (Properties.has(datatype)) {
    return Properties.get(datatype)!;
  }
 
  return {
    '@id': {
      type: 'string',
      format: 'uri',
      pattern: `^${baseURI.replace(RE_SLASH, '\\/').replace(RE_DOT, '\\.')}id\\/${label}\\/\\d`,
    },
  };
}
