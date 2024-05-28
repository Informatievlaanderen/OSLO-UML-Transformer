import { EaAttribute } from '../types/EaAttribute';
import type { EaElement } from '../types/EaElement';

export function mapToEaAttribute(data: any[], elements: EaElement[]): EaAttribute[] {
  const elementIds = new Set(elements.map(x => x.id));
  const attributes = data.reduce((attributesArray: EaAttribute[], attribute: any): EaAttribute[] => {
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
      ));
    }

    return attributesArray;
  }, []);

  attributes.forEach(x => setAttributePath(x, elements));

  return attributes;
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