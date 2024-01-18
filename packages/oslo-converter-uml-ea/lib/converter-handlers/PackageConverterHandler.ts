import { URL } from 'url';
import type { QuadStore } from '@oslo-flanders/core';
import { ns } from '@oslo-flanders/core';
import type { DataRegistry, EaPackage } from '@oslo-flanders/ea-uml-extractor';
import type * as RDF from '@rdfjs/types';
import { injectable } from 'inversify';
import { TagNames } from '../enums/TagNames';
import type { UriRegistry } from '../UriRegistry';
import { getTagValue, ignore } from '../utils/utils';
import { ConverterHandler } from '@oslo-converter-uml-ea/interfaces/ConverterHandler';

@injectable()
export class PackageConverterHandler extends ConverterHandler<EaPackage> {
  public async filterIgnoredObjects(model: DataRegistry): Promise<DataRegistry> {
    model.packages = model.packages.filter(x => !ignore(x));

    return model;
  }

  public async convert(model: DataRegistry, uriRegistry: UriRegistry, store: QuadStore): Promise<QuadStore> {
    // Only the information of the target diagram's package is added to the output
    model.packages
      .filter(x => x.packageId === model.targetDiagram.packageId)
      .forEach(object => store.addQuads(this.createQuads(object, uriRegistry)));

    return store;
  }

  public async normalize(model: DataRegistry): Promise<DataRegistry> {
    return model;
  }

  public async assignUris(model: DataRegistry, uriRegistry: UriRegistry): Promise<UriRegistry> {
    uriRegistry.packageIdUriMap = new Map<number, URL>();
    uriRegistry.packageIdOntologyUriMap = new Map<number, URL>();
    uriRegistry.packageNameToPackageMap = new Map<string, EaPackage[]>();

    model.packages.forEach(packageObject => {
      uriRegistry.packageNameToPackageMap
        .set(packageObject.name, [...uriRegistry.packageNameToPackageMap.get(packageObject.name) || [], packageObject]);

      let packageUri: string | null = getTagValue(packageObject, TagNames.PackageBaseUri, null);

      if (!packageUri) {
        this.logger.warn(`[PackageConverterHandler]: No value found for tag "baseUri" in package (${packageObject.path}) and fallback URI (${uriRegistry.fallbackBaseUri}) will be assigned.`);
        packageUri = uriRegistry.fallbackBaseUri;
      }

      const namespace: string = packageUri.slice(0, -1);
      const ontologyURI: string = getTagValue(packageObject, TagNames.PackageOntologyUri, namespace);

      uriRegistry.packageIdUriMap.set(packageObject.packageId, new URL(packageUri));
      uriRegistry.packageIdOntologyUriMap.set(packageObject.packageId, new URL(ontologyURI));
    });

    return uriRegistry;
  }

  public createQuads(object: EaPackage, uriRegistry: UriRegistry): RDF.Quad[] {
    const quads: RDF.Quad[] = [];
    const ontologyUri: URL | undefined = uriRegistry.packageIdOntologyUriMap.get(object.packageId);
    const baseUri: URL | undefined = uriRegistry.packageIdUriMap.get(object.packageId);

    if (!ontologyUri) {
      throw new Error(`[PackageConverterHandler]: Unable to find ontology URI for package (${object.path}).`);
    }

    if (!baseUri) {
      throw new Error(`[PackageConverterHandler]: Unable to find base URI for package (${object.path}).`);
    }

    const ontologyUriNamedNode: RDF.NamedNode = this.df.namedNode(ontologyUri.toString());
    const packageInternalId: RDF.NamedNode = this.df.namedNode(`${this.baseUrnScheme}:${object.osloGuid}`);

    quads.push(
      this.df.quad(
        packageInternalId,
        ns.rdf('type'),
        ns.oslo('Package'),
      ),
      this.df.quad(
        packageInternalId,
        ns.oslo('assignedURI'),
        ontologyUriNamedNode,
      ),
      this.df.quad(
        packageInternalId,
        ns.oslo('baseURI'),
        this.df.namedNode(baseUri.toString()),
      ),
    );

    return quads;
  }
}
