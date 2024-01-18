import alasql from 'alasql';
import type MDBReader from 'mdb-reader';
import type { DataRegistry } from '../DataRegistry';
import { EaPackage } from '../types/EaPackage';
import { addEaTagsToElements } from './assignTags';
import { EaTable } from '@oslo-extractor-uml-ea/enums/EaTable';

export function loadPackages(mdb: MDBReader, model: DataRegistry): DataRegistry {
  const packages = mdb.getTable(EaTable.Package).getData();
  const elements = mdb.getTable(EaTable.Object).getData();

  const query = `
    SELECT package.Package_ID, package.Name, package.Parent_ID, package.ea_guid, element.Object_ID, element.Stereotype, element.Note
    FROM ? package
    LEFT JOIN ? element ON package.ea_guid = element.ea_guid`;

  const data = <any[]>alasql(query, [packages, elements]);
  model.packages = data.map(item => new EaPackage(
    <number>item.Object_ID,
    <string>item.Name,
    <string>item.ea_guid,
    <number>item.Package_ID,
    <number>item.Parent_ID,
  ));

  // For each package, find and set their parent (if it exists) and add it to their path
  model.packages.forEach(packageObject => {
    const parentPackage = model.packages.find(x => x.packageId === packageObject.parentId);

    if (!parentPackage) {
      return;
    }

    packageObject.setParent(parentPackage);
    packageObject.path = `${packageObject.parent?.path}:${packageObject.name}`;
  });

  // Object tags contains tags for packages and elements.
  // If tags are added in the load function, then warnings are logged because one is not present
  const objectTags = mdb.getTable(EaTable.ClassAndPackageTag).getData();
  addEaTagsToElements(objectTags, model.packages, 'Object_ID', 'Value');

  return model;
}
