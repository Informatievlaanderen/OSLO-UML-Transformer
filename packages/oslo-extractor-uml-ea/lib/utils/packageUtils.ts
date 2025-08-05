import { EaPackage } from '../types/EaPackage';

export function mapToEaPackages(data: any[]): EaPackage[] {
  const packages = data.map(
    (item) =>
      new EaPackage(
        <number>item.Object_ID,
        <string>item.Name,
        <string>item.ea_guid,
        <number>item.Package_ID,
        <number>item.Parent_ID,
      ),
  );

  // For each package, find and set their parent (if present) and add it to their path
  packages.forEach((packageObject) => {
    const parentPackage = packages.find(
      (x) => x.packageId === packageObject.parentId,
    );

    if (!parentPackage) {
      return;
    }

    packageObject.setParent(parentPackage);
    packageObject.path = `${packageObject.parent?.path}:${packageObject.name}`;
  });

  return packages;
}
