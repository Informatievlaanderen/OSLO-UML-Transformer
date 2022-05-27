import type MDBReader from 'mdb-reader';
import { getLoggerFor } from '@oslo-flanders/core';
import { EaTable } from './enums/EaTable';
import { EaAttribute } from './types/EaAttribute';
import { EaElement } from './types/EaElement';
import { addEaTagsToElements } from './utils/tags';

export function loadAttributes(reader: MDBReader, elements: EaElement[]): EaAttribute[] {
  const attributes = reader.getTable(EaTable.Attribute).getData();
  const elementIds = new Set(elements.map(x => x.id));

  const eaAttributes = attributes.reduce((attributesArray: EaAttribute[], attribute: any): EaAttribute[] => {
    // Verification that each attribute is linked to a class
    if (elementIds.has(<number>attribute.Object_ID)) {
      attributesArray.push(new EaAttribute(
        <number>attribute.ID,
        <string>attribute.ea_guid,
        <string>attribute.Name,
        <number>attribute.Object_ID,
        <string>attribute.Type,
        <string>attribute.LowerBound,
        <string>attribute.UpperBound,
      ));
    }

    return attributesArray;
  }, []);

  eaAttributes.forEach(attribute => setAttributePath(attribute, elements));

  const attributeTags = reader.getTable(EaTable.AttributeTag).getData();
  addEaTagsToElements(attributeTags, eaAttributes, 'ElementID', 'VALUE');

  return eaAttributes;
}

function setAttributePath(attribute: EaAttribute, elements: EaElement[]): void {
  const logger = getLoggerFor(`AttributeLoader`);
  const eaClass = elements.find(x => x.id === attribute.classId);
  let path: string;

  if (!eaClass) {
    logger.warn(`Unable to find class for attribute with guid ${attribute.eaGuid}. Setting path to '${attribute.name}'.`);
    path = attribute.name;
  } else {
    path = `${eaClass.path}:${attribute.name}`;
  }

  attribute.path = path;
}