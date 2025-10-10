import type { QuadStore } from '@oslo-flanders/core';
import { ns } from '@oslo-flanders/core';
import type {
  DataRegistry,
  EaCrossReference,
} from '@oslo-flanders/ea-uml-extractor';
import { CrossReferenceType } from '@oslo-flanders/ea-uml-extractor';
import type * as RDF from '@rdfjs/types';
import { injectable } from 'inversify';
import { ConverterHandler } from '../interfaces/ConverterHandler';
import type { UriRegistry } from '../UriRegistry';
import { ignore } from '../utils/utils';

@injectable()
export class CrossConverterConverterHandler extends ConverterHandler<EaCrossReference> {
  public async filterHiddenObjects(model: DataRegistry): Promise<DataRegistry> {
    // https://vlaamseoverheid.atlassian.net/browse/SDTT-359
    // Hidden packages are currently not supported. Only connectors.
    return model;
  }
  public async filterIgnoredObjects(
    model: DataRegistry,
  ): Promise<DataRegistry> {
    model.crossReferences = model.crossReferences.filter((x) => !ignore(x));

    return model;
  }

  public async convert(
    model: DataRegistry,
    uriRegistry: UriRegistry,
    store: QuadStore,
  ): Promise<QuadStore> {
    // Only the information of the target diagram's package is added to the output
    model.crossReferences.forEach((object) =>
      store.addQuads(this.createQuads(object, uriRegistry)),
    );

    return store;
  }

  public async normalize(model: DataRegistry): Promise<DataRegistry> {
    return model;
  }

  public async assignUris(
    model: DataRegistry,
    uriRegistry: UriRegistry,
  ): Promise<UriRegistry> {
    return uriRegistry;
  }

  public createQuads(
    object: EaCrossReference,
    uriRegistry: UriRegistry,
  ): RDF.Quad[] {
    const quads: RDF.Quad[] = [];
    let crossReferenceType: RDF.Quad;
    const parentAttribute: RDF.NamedNode = this.df.namedNode(
      `${this.baseUrnScheme}:${object.parentOsloGuid}`,
    );
    const childAttribute: RDF.NamedNode = this.df.namedNode(
      `${this.baseUrnScheme}:${object.childOsloGuid}`,
    );
    const crossReferenceInternalId: RDF.NamedNode = this.df.namedNode(
      `${this.baseUrnScheme}:${object.osloGuid}`,
    );

    switch (object.type) {
      case CrossReferenceType.Redefined:
        crossReferenceType = ns.oslo('RedefinedAttribute');
        break;
      case CrossReferenceType.Subsetted:
        crossReferenceType = ns.oslo('SubsettedAttribute');
        break;
      default:
        throw new Error(
          `[CrossReferenceConverterHandler] Cross reference type is unsupported!`,
        );
    }

    quads.push(
      this.df.quad(
        crossReferenceInternalId,
        ns.rdf('type'),
        crossReferenceType,
      ),
      this.df.quad(
        crossReferenceInternalId,
        ns.oslo('parentAttribute'),
        parentAttribute,
      ),
      this.df.quad(
        crossReferenceInternalId,
        ns.oslo('childAttribute'),
        childAttribute,
      ),
    );

    return quads;
  }
}
