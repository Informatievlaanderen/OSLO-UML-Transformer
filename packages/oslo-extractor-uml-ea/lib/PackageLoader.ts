import alasql from 'alasql';
import type MDBReader from 'mdb-reader';
import { EaTable } from './enums/EaTable';
import { EaPackage } from './types/EaPackage';

export function loadPackages(eaReader: MDBReader): EaPackage[] {
  const packages = eaReader.getTable(EaTable.Package).getData();
  const elements = eaReader.getTable(EaTable.Object).getData();

  const query = `
    SELECT package.Package_ID, package.Name, package.Parent_ID, package.ea_guid, element.Object_ID, element.Stereotype, element.Note
    FROM ? package
    LEFT JOIN ? element ON package.ea_guid = element.ea_guid`;

  const eaPackages = (<any[]>alasql(query, [packages, elements])).map(item => new EaPackage(
    <number>item.Object_ID,
    <string>item.Name,
    <string>item.ea_guid,
    <number>item.Package_ID,
    <number>item.Parent_ID,
  ));

  eaPackages.forEach(_package => {
    const parentPackage = eaPackages.find(x => x.packageId === _package.parentId);

    if (!parentPackage) {
      return;
    }

    _package.setParent(parentPackage);
    _package.path = `${_package.parent?.path}:${_package.name}`;
  });

  return eaPackages;
}
