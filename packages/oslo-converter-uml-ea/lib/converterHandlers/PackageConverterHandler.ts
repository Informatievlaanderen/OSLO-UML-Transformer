import { ns } from '@oslo-flanders/core';
import type { EaObject, EaPackage } from '@oslo-flanders/ea-uml-extractor';
import { RequestType } from '../enums/RequestType';
import { ConverterHandler } from '../types/ConverterHandler';

export class PackageConverterHandler extends ConverterHandler<EaPackage> {
  public async handleRequest(requestType: RequestType, object: EaObject): Promise<void> {
    if (requestType === RequestType.AddPackageToOutput) {
      return this.addObjectToOutput(<EaPackage>object);
    }
    return super.handleRequest(requestType, object);
  }

  public async addObjectToOutput(
    _package: EaPackage,
  ): Promise<void> {
    const ontologyUriMap = this.uriAssigner.packageIdOntologyUriMap;
    const baseUriMap = this.uriAssigner.packageIdUriMap;

    const ontologyUri = ontologyUriMap.get(_package.packageId)!;
    const ontologyNamedNode = this.factory.namedNode(ontologyUri);

    // Publish a unique reference of this attribute
    const uniqueInternalIdNamedNode = ns.example(`.well-known/${_package.osloGuid}`);
    this.outputHandler.add(uniqueInternalIdNamedNode, ns.example('guid'), ontologyNamedNode);

    this.outputHandler.add(uniqueInternalIdNamedNode, ns.rdf('type'), ns.example('Package'));

    const baseUri = baseUriMap.get(_package.packageId)!;
    const baseUriNamedNode = this.factory.namedNode(baseUri);

    this.outputHandler.add(uniqueInternalIdNamedNode, ns.example('baseUri'), baseUriNamedNode);
  }
}
