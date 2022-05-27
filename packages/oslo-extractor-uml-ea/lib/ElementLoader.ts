import alasql from 'alasql';
import type MDBReader from 'mdb-reader';
import { ElementType } from './enums/ElementType';
import type { EaPackage } from './types/EaPackage';
import { EaTable } from './enums/EaTable';
import { EaElement } from './types/EaElement';

export function loadElements(reader: MDBReader, packages: EaPackage[]): EaElement[] {
  const objects = reader.getTable(EaTable.Object).getData();
  const query = `
    SELECT Object_ID, Object_Type, Name, Note, Package_ID, Stereotype, ea_guid
    FROM ? object
    WHERE Object_Type IN ('Class', 'DataType', 'Enumeration')`;

  const eaElements = (<any[]>alasql(query, [objects])).map(item => new EaElement(
    <number>item.Object_ID,
    <string>item.ea_guid,
    <string>item.Name,
    getElementType(<string>item.Object_Type),
    <number>item.Package_ID,
  ));

  eaElements.forEach(element => setElementPath(element, packages));
  return eaElements;
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
    // Log error
    path = element.name;
  } else {
    path = `${elementPackage.path}:${element.name}`;
  }

  element.path = path;
}