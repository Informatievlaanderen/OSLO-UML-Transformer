import { ns } from '@oslo-flanders/core';
import type { DataRegistry, EaPackage } from '@oslo-flanders/ea-uml-extractor';
import type * as RDF from '@rdfjs/types';
import { injectable } from 'inversify';
import type * as N3 from 'n3';
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

  public async convert(model: DataRegistry, uriRegistry: UriRegistry, store: RDF.Store): Promise<RDF.Store> {
    // Only the information of the target diagram's package is added to the output
    model.packages
      .filter(x => x.packageId === model.targetDiagram.packageId)
      .forEach(object => (<N3.Store>store).addQuads(this.createQuads(object, uriRegistry)));

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
      if (!uriRegistry.packageNameToPackageMap.has(packageObject.name)) {
        uriRegistry.packageNameToPackageMap.set(packageObject.name, []);
      }

      uriRegistry.packageNameToPackageMap
        .set(packageObject.name, [...uriRegistry.packageNameToPackageMap.get(packageObject.name) || [], packageObject]);

      const packageUri = getTagValue(packageObject, TagNames.PackageBaseUri, this.config.baseUri);
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
      throw new Error(`Package with EA guid ${object.eaGuid} has no URI assigned.`);
    }

    if (!baseUri) {
      throw new Error(`Package with EA guid ${object.eaGuid} has no base URI set.`);
    }

    const ontologyUriNamedNode = this.df.namedNode(ontologyUri.toString());

    quads.push(
      this.df.quad(
        ontologyUriNamedNode,
        ns.rdf('type'),
        ns.example('Package'),
      ),
      this.df.quad(
        ontologyUriNamedNode,
        ns.example('baseUri'),
        this.df.namedNode(baseUri.toString()),
      ),
    );

    return quads;
  }
}
