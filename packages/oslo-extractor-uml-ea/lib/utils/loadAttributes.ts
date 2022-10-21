import { DataRegistry } from "../DataRegistry";
import MDBReader from "mdb-reader";
import { EaTable } from "../enums/EaTable";
import { EaAttribute } from "../types/EaAttribute";
import { EaElement } from "../types/EaElement";
import { addEaTagsToElements } from "./assignTags";

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
      ));
    }

    return attributesArray;
  }, []);

  model.attributes.forEach(attribute => setAttributePath(attribute, model.elements))

  const attributeTags = mdb.getTable(EaTable.AttributeTag).getData();
  addEaTagsToElements(attributeTags, model.attributes, 'ElementID', 'VALUE');

  return model;
}

function setAttributePath(attribute: EaAttribute, elements: EaElement[]): void {
  const eaClass = elements.find(x => x.id === attribute.classId);
  let path: string;

  if (!eaClass) {
    //logger.warn(`Unable to find class for attribute with guid ${attribute.eaGuid}. Setting path to '${attribute.name}'.`);
    path = attribute.name;
  } else {
    path = `${eaClass.path}:${attribute.name}`;
  }

  attribute.path = path;
}