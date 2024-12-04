import { URL } from 'url';
import type { QuadStore } from '@oslo-flanders/core';
import { ns } from '@oslo-flanders/core';
import type {
  DataRegistry,
  EaElement,
  EaPackage,
  NormalizedConnector,
} from '@oslo-flanders/ea-uml-extractor';
import { ConnectorType } from '@oslo-flanders/ea-uml-extractor';
import type * as RDF from '@rdfjs/types';
import { inject, injectable } from 'inversify';
import { EaUmlConverterServiceIdentifier } from '../config/EaUmlConverterServiceIdentifier';
import { ConnectorNormalisationService } from '../ConnectorNormalisationService';
import { TagNames } from '../enums/TagNames';
import { ConverterHandler } from '../interfaces/ConverterHandler';
import type { UriRegistry } from '../UriRegistry';
import { getTagValue, ignore, toCamelCase } from '../utils/utils';

@injectable()
export class ConnectorConverterHandler extends ConverterHandler<NormalizedConnector> {
  @inject(EaUmlConverterServiceIdentifier.ConnectorNormalisationService)
  private readonly connectorNormalisationService!: ConnectorNormalisationService;

  public async filterIgnoredObjects(
    model: DataRegistry,
  ): Promise<DataRegistry> {
    model.connectors = model.connectors.filter((x) => !ignore(x));

    return model;
  }

  public async convert(
    model: DataRegistry,
    uriRegistry: UriRegistry,
    store: QuadStore,
  ): Promise<QuadStore> {
    model.normalizedConnectors
      .filter((x) => model.targetDiagram.connectorsIds.includes(x.originalId))
      .forEach((object) =>
        store.addQuads(this.createQuads(object, uriRegistry, model)),
      );

    return store;
  }

  public async normalize(model: DataRegistry): Promise<DataRegistry> {
    const tasks: Promise<NormalizedConnector[]>[] = model.connectors
      .filter((x) => model.targetDiagram.connectorsIds.includes(x.id))
      .map((connector) =>
        this.connectorNormalisationService.normalise(connector, model),
      );

    model.normalizedConnectors = await Promise.all(tasks).then((x) => x.flat());

    return model;
  }

  public async assignUris(
    model: DataRegistry,
    uriRegistry: UriRegistry,
  ): Promise<UriRegistry> {
    uriRegistry.connectorOsloIdUriMap = new Map<number, URL>();
    const diagramConnectors: NormalizedConnector[] = [];

    model.targetDiagram.connectorsIds.forEach((connectorId) => {
      const filteredConnectors =
        model.normalizedConnectors.filter(
          (x) => x.originalId === connectorId,
        ) || [];
      diagramConnectors.push(...filteredConnectors);
    });

    diagramConnectors.forEach((connector) => {
      // Inheritance related connectors do not get an URI.
      if (connector.originalType === ConnectorType.Generalization) {
        return;
      }

      const externalUri: string | null = getTagValue(
        connector,
        TagNames.ExternalUri,
        null,
      );
      if (externalUri) {
        try {
          uriRegistry.connectorOsloIdUriMap.set(
            connector.id,
            new URL(externalUri),
          );
        } catch (error: unknown) {
          throw new Error(
            `[ConnectorConverterHandler]: Invalid external URI (${externalUri}) for connector (${connector.path})`,
          );
        }
        return;
      }

      const packageTagValue: string | null = getTagValue(
        connector,
        TagNames.DefiningPackage,
        null,
      );
      let baseUri: string | undefined;
      if (packageTagValue) {
        const packageObject: EaPackage | undefined = model.packages.find(
          (x) => x.name === packageTagValue,
        );

        if (!packageObject) {
          throw new Error(
            `[ConnectorConverterHandler]: Package tag (${packageTagValue}) was set for connector ${connector.path}, but could not find the package object.`,
          );
        }

        const packageUri: URL | undefined = uriRegistry.packageIdUriMap.get(
          packageObject.packageId,
        );
        if (!packageUri) {
          throw new Error(
            `[ConnectorConverterHandler]: Unable to find the URI for package (${packageObject.path}).`,
          );
        }

        baseUri = packageUri.toString();
      } else {
        const sourcePackage: EaElement | undefined = model.elements.find(
          (x) => x.id === connector.sourceObjectId,
        );
        const destinationPackage: EaElement | undefined = model.elements.find(
          (x) => x.id === connector.destinationObjectId,
        );

        if (
          sourcePackage &&
          destinationPackage &&
          sourcePackage.packageId === destinationPackage.packageId
        ) {
          baseUri = uriRegistry.packageIdUriMap
            .get(sourcePackage.packageId)!
            .toString();
        } else {
          this.logger.warn(
            `[ConnectorConverterHandler]: Can not determine the correct base URI for connector (${connector.path}) and the fallback URI (${uriRegistry.fallbackBaseUri}) will be assigned.`,
          );
          baseUri = uriRegistry.fallbackBaseUri;
        }
      }

      let localName: string = getTagValue(
        connector,
        TagNames.LocalName,
        connector.name,
      );

      if (!localName) {
        throw new Error(
          `[ConnectorConverterHandler]: Unable to find local name for connector (${connector.path}).`,
        );
      }

      // Names on the diagram are not prefixed, so if this value contains
      // a prefix (by checking for a dot), we assume this value was added by the editor through
      // a name tag. We assume the spelling is correctly done and we do not camel case it.
      if (!localName.includes('.')) {
        localName = toCamelCase(localName);
      }

      try {
        const connectorUri = new URL(`${baseUri}${localName}`);
        uriRegistry.connectorOsloIdUriMap.set(connector.id, connectorUri);
      } catch (error: unknown) {
        throw new Error(
          `[ConnectorConverterHandler]: Invalid URL (${baseUri}${localName}) for connector (${connector.path})`,
        );
      }
    });

    return uriRegistry;
  }

  public createQuads(
    object: NormalizedConnector,
    uriRegistry: UriRegistry,
    model: DataRegistry,
  ): RDF.Quad[] {
    const quads: RDF.Quad[] = [];

    const connectorInternalId: RDF.NamedNode = this.df.namedNode(
      `${this.baseUrnScheme}:${object.osloGuid}`,
    );
    const connectorUri: URL | undefined = uriRegistry.connectorOsloIdUriMap.get(
      object.id,
    );

    if (!connectorUri) {
      throw new Error(
        `[ConnectorConverterHandler]: Unable to find URI for connector (${object.path})`,
      );
    }

    const connectorUriNamedNode: RDF.NamedNode = this.df.namedNode(
      connectorUri.toString(),
    );

    quads.push(
      this.df.quad(
        connectorInternalId,
        ns.rdf('type'),
        ns.owl('ObjectProperty'),
      ),
      this.df.quad(
        connectorInternalId,
        ns.oslo('assignedURI'),
        connectorUriNamedNode,
      ),
    );

    // Adding definitions, labels and usage notes
    this.addEntityInformation(object, connectorInternalId, quads);

    const domainObject: EaElement | undefined = model.elements.find(
      (x) => x.id === object.sourceObjectId,
    );

    if (domainObject) {
      const domainInternalId = this.df.namedNode(
        `${this.baseUrnScheme}:${domainObject.osloGuid}`,
      );
      quads.push(
        this.df.quad(connectorInternalId, ns.rdfs('domain'), domainInternalId),
      );
    }

    const rangeObject: EaElement | undefined = model.elements.find(
      (x) => x.id === object.destinationObjectId,
    );

    if (rangeObject) {
      const rangeInternalId = this.df.namedNode(
        `${this.baseUrnScheme}:${rangeObject.osloGuid}`,
      );

      quads.push(
        this.df.quad(connectorInternalId, ns.rdfs('range'), rangeInternalId),
      );
    }

    const packageBaseUri: URL | undefined = uriRegistry.packageIdUriMap.get(
      model.targetDiagram.packageId,
    );

    if (!packageBaseUri) {
      throw new Error(
        `[ConnectorConverterHandler]: Unnable to find URI for the package in which the target diagram (${model.targetDiagram.name}) was placed.`,
      );
    }

    this.addScope(
      object,
      connectorInternalId,
      packageBaseUri.toString(),
      uriRegistry.connectorOsloIdUriMap,
      this.df.defaultGraph(),
      quads,
    );

    let minCardinality: string;
    let maxCardinality: string;

    if (object.cardinality) {
      if (object.cardinality.includes('..')) {
        [minCardinality, maxCardinality] = object.cardinality.split('..');
      } else {
        minCardinality = maxCardinality = object.cardinality;
      }

      quads.push(
        this.df.quad(
          connectorInternalId,
          ns.shacl('minCount'),
          this.df.literal(minCardinality),
        ),
        this.df.quad(
          connectorInternalId,
          ns.shacl('maxCount'),
          this.df.literal(maxCardinality),
        ),
      );
    } else {
      this.logger.warn(
        `[ConnectorConverterHandler]: Unable to determine cardinality for connector (${object.path}).`,
      );
    }

    const parentUri: string | null = getTagValue(
      object,
      TagNames.ParentUri,
      null,
    );
    if (parentUri) {
      quads.push(
        this.df.quad(
          connectorInternalId,
          ns.rdfs('subPropertyOf'),
          this.df.namedNode(parentUri),
        ),
      );
    }
    return quads;
  }
}
