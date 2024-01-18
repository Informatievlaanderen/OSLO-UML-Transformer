import { uniqueId } from '@oslo-flanders/core';
import { EaObject } from '@oslo-extractor-uml-ea/types/EaObject';

/**
 * Represents a package in Enterprise Architect
 * @description - A package has two fields pointing to an identifier:
 *  1. id (inferred from EaObject) - references the object id
 *  2. packageId - references the actual packageId which must be used by other objects
 * to refer to the package
 */
export class EaPackage extends EaObject {
  public readonly packageId: number;
  public parentId: number;
  public parent: EaPackage | undefined;

  public constructor(
    id: number,
    name: string,
    guid: string,
    packageId: number,
    parentId: number,
  ) {
    super(id, name, guid);

    this.packageId = packageId;
    this.parentId = parentId;

    this.osloGuid = uniqueId(guid, name, id);
  }

  public setParent(parent: EaPackage): void {
    this.parent = parent;
  }
}
