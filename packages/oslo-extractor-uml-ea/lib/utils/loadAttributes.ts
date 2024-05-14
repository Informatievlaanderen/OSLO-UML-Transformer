import type MDBReader from 'mdb-reader';
import type { DataRegistry } from '../DataRegistry';
import { EaTable } from '../enums/EaTable';
import { EaAttribute } from '../types/EaAttribute';
import type { EaElement } from '../types/EaElement';
import { addEaTagsToElements } from '../utils/assignTags';

export function loadAttributes(mdb: MDBReader, model: DataRegistry): DataRegistry {
  const attributes = mdb.getTable(EaTable.Attribute).getData();
  const elementIds = new Set(model.elements.map(x => x.id));

  model.attributes = attributes.reduce((attributesArray: EaAttribute[], attribute: any): EaAttribute[] => {
    // Verification that each attribute is linked to a class
    if (elementIds.has(<number>attribute.Object_ID)) {
      attributesArray.push(new EaAttribute(
        <number>attribute.ID,
        <string>attribute.Name,
        <string>attribute.ea_guid,
        <number>attribute.Object_ID,
        <string>attribute.Type,
        <string>attribute.LowerBound,
        <string>attribute.UpperBound,
        Number.parseInt(attribute.Classifier, 10) || undefined,
      ));
    }

    return attributesArray;
  }, []);

  model.attributes.forEach(attribute => setAttributePath(attribute, model.elements));

  const attributeTags = mdb.getTable(EaTable.AttributeTag).getData();
  addEaTagsToElements(attributeTags, model.attributes, 'ElementID', 'VALUE');

  return model;
}

function setAttributePath(attribute: EaAttribute, elements: EaElement[]): void {
  const eaClass = elements.find(x => x.id === attribute.classId);
  let path: string;

  if (!eaClass) {
    // TODO: log message
    path = attribute.name;
  } else {
    path = `${eaClass.path}:${attribute.name}`;
  }

  attribute.path = path;
}
