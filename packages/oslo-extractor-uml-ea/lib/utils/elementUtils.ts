import { ElementType } from '../enums/ElementType';
import { EaElement } from '../types/EaElement';
import type { EaPackage } from '../types/EaPackage';

export function mapToEaElement(
  data: any[],
  packages: EaPackage[],
): EaElement[] {
  const elements = data.map(
    (item) =>
      new EaElement(
        <number>item.Object_ID,
        <string>item.Name,
        <string>item.ea_guid,
        getElementType(<string>item.Object_Type),
        <number>item.Package_ID,
      ),
  );

  elements.forEach((element) => setElementPath(element, packages));

  return elements;
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
  const elementPackage = packages.find(
    (x) => x.packageId === element.packageId,
  );
  let path: string;

  if (!elementPackage) {
    path = element.name;
  } else {
    path = `${elementPackage.path}:${element.name}`;
  }

  element.path = path;
}
