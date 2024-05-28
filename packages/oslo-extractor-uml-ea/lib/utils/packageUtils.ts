import { EaPackage } from "../types/EaPackage";

export function mapToEaPackages(data: any[]): EaPackage[] {
  const packages = data.map(item => new EaPackage(
    <number>item.Object_ID,
    <string>item.Name,
    <string>item.ea_guid,
    <number>item.Package_ID,
    <number>item.Parent_ID,
  ));

  // For each package, find and set their parent (if present) and add it to their path
  packages.forEach(object => {
    const parent = packages.find(x => x.packageId === object.parentId);

    if (!parent) {
      return;
    }

    object.setParent(parent);
    object.path = `${object.parent?.path}:${object.name}`;
  });

  return packages;
}