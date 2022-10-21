import { DataRegistry } from "../DataRegistry";
import MDBReader from "mdb-reader";
import { EaTable } from "../enums/EaTable";
import alasql from "alasql";
import { EaElement } from "../types/EaElement";
import { EaPackage } from "../types/EaPackage";
import { ElementType } from "../enums/ElementType";
import { addEaTagsToElements } from "./assignTags";

export function loadElements(mdb: MDBReader, model: DataRegistry): DataRegistry {
  const objects = mdb.getTable(EaTable.Object).getData();

  const query = `
    SELECT Object_ID, Object_Type, Name, Note, Package_ID, Stereotype, ea_guid
    FROM ? object
    WHERE Object_Type IN ('Class', 'DataType', 'Enumeration')`;

  model.elements = (<any[]>alasql(query, [objects])).map(item => new EaElement(
    <number>item.Object_ID,
    <string>item.Name,
    <string>item.ea_guid,
    getElementType(<string>item.Object_Type),
    <number>item.Package_ID,
  ));

  model.elements.forEach(element => setElementPath(element, model.packages));

  // Object tags contains tags for packages and elements.
  // If tags are added in the load function, then warnings are logged because one is not present
  const objectTags = mdb.getTable(EaTable.ClassAndPackageTag).getData();
  addEaTagsToElements(objectTags, model.elements, 'Object_ID', 'Value');

  return model;
}

function getElementType(type: string): ElementType {
  switch (type) {
    case 'Class':
      return ElementType.Class;

    case 'DataType':
      return ElementType.DataType;

    case 'Enumeration':
      return ElementType.Enumeration;

    default:
      throw new Error(`Invalid element type: ${type}`);
  }
}

function setElementPath(element: EaElement, packages: EaPackage[]): void {
  const elementPackage = packages.find(x => x.packageId === element.packageId);
  let path: string;

  if (!elementPackage) {
    //logger.warn(`Unnable to find package to which element with EA guid ${element.eaGuid} belonags. Setting path to its name '${element.name}'.`);
    path = element.name;
  } else {
    path = `${elementPackage.path}:${element.name}`;
  }

  element.path = path;
}