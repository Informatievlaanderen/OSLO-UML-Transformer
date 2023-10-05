import type { QuadStore } from '@oslo-flanders/core';
import { ns } from '@oslo-flanders/core';
import type { DataRegistry, EaPackage } from '@oslo-flanders/ea-uml-extractor';
import type * as RDF from '@rdfjs/types';
import { injectable } from 'inversify';
import { TagNames } from '../enums/TagNames';
import { ConverterHandler } from '../interfaces/ConverterHandler';
import type { UriRegistry } from '../UriRegistry';
import { getTagValue, ignore } from '../utils/utils';

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

      let packageUri = getTagValue(packageObject, TagNames.PackageBaseUri, null);

      if (!packageUri) {
        this.logger.warn(`[PackageConverterHandler]: No value found for tag "baseUri" in package (${packageObject.path}) and fallback URI (${uriRegistry.fallbackBaseUri}) will be assigned.`);
        packageUri = uriRegistry.fallbackBaseUri;
      }

      const namespace = packageUri.slice(0, -1);
      const ontologyURI = getTagValue(packageObject, TagNames.PackageOntologyUri, namespace);

      uriRegistry.packageIdUriMap.set(packageObject.packageId, new URL(packageUri));
      uriRegistry.packageIdOntologyUriMap.set(packageObject.packageId, new URL(ontologyURI));
    });

    return uriRegistry;
  }

  public createQuads(object: EaPackage, uriRegistry: UriRegistry): RDF.Quad[] {
    const quads: RDF.Quad[] = [];
    const ontologyUri = uriRegistry.packageIdOntologyUriMap.get(object.packageId);
    const baseUri = uriRegistry.packageIdUriMap.get(object.packageId);

    if (!ontologyUri) {
      throw new Error(`[PackageConverterHandler]: Unable to find ontology URI for package (${object.path}).`);
    }

    if (!baseUri) {
      throw new Error(`[PackageConverterHandler]: Unable to find base URI for package (${object.path}).`);
    }

    const ontologyUriNamedNode = this.df.namedNode(ontologyUri.toString());
    const packageInternalId = this.df.namedNode(`${this.baseUrnScheme}:${object.osloGuid}`);

    quads.push(
      this.df.quad(
        packageInternalId,
        ns.rdf('type'),
        ns.example('Package'),
      ),
      this.df.quad(
        packageInternalId,
        ns.example('assignedUri'),
        ontologyUriNamedNode,
      ),
      this.df.quad(
        packageInternalId,
        ns.example('baseUri'),
        this.df.namedNode(baseUri.toString()),
      ),
    );

    return quads;
  }
}
