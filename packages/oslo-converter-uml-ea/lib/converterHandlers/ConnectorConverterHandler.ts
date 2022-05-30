import { ns } from '@oslo-flanders/core';
import type { EaDiagram, EaObject } from '@oslo-flanders/ea-uml-extractor';
import { RequestType } from '../enums/RequestType';
import { TagName } from '../enums/TagName';
import { ConverterHandler } from '../types/ConverterHandler';
import type { NormalizedConnector } from '../types/NormalizedConnector';
import { getTagValue } from '../utils/utils';

export class ConnectorConverterHandler extends ConverterHandler<NormalizedConnector> {
  public async handleRequest(requestType: RequestType, object: EaObject): Promise<void> {
    if (requestType === RequestType.AddConnectorToOutput) {
      return this.addObjectToOutput(<NormalizedConnector>object, this.mediator.targetDiagram);
    }
    return super.handleRequest(requestType, object);
  }

  public async addObjectToOutput(
    connector: NormalizedConnector,
    targetDiagram: EaDiagram,
  ): Promise<void> {
    const connectorIdUriMap = this.uriAssigner.connectorIdUriMap;
    const elementUriMap = this.uriAssigner.elementIdUriMap;
    const packageUri = this.uriAssigner.packageIdUriMap.get(targetDiagram.packageId)!;

    const connectorUri = connectorIdUriMap.get(connector.id);

    if (!connectorUri) {
      // Log error
      return;
    }

    const connectorUriNamedNode = this.factory.namedNode(connectorUri);

    // Publish a unique reference of this attribute
    const uniqueInternalIdNamedNode = ns.example(`.well-known/${connector.osloGuid}`);
    this.outputHandler.add(uniqueInternalIdNamedNode, ns.example('guid'), connectorUriNamedNode);

    this.outputHandler.add(uniqueInternalIdNamedNode, ns.rdf('type'), ns.owl('ObjectProperty'));

    const definition = this.getDefinition(connector);
    this.outputHandler.add(uniqueInternalIdNamedNode, ns.rdfs('comment'), definition);

    const label = this.getLabel(connector);
    this.outputHandler.add(uniqueInternalIdNamedNode, ns.rdfs('label'), label);

    const usageNote = this.getUsageNote(connector);
    this.outputHandler.add(uniqueInternalIdNamedNode, ns.vann('usageNote'), usageNote);

    const elements = this.mediator.getElements();

    const domainWellKnownId = elements.find(x => x.id === connector.sourceObjectId)?.osloGuid;
    this.outputHandler.add(uniqueInternalIdNamedNode, ns.rdfs('domain'), ns.example(`.well-known/${domainWellKnownId}`));

    const rangeWellKnownId = elements.find(x => x.id === connector.destinationObjectId)?.osloGuid;
    this.outputHandler.add(uniqueInternalIdNamedNode, ns.rdfs('range'), ns.example(`.well-known/${rangeWellKnownId}`));

    const scope = this.getScope(connector, packageUri, connectorIdUriMap);
    // TODO: remove example.org
    const scopeLiteral = this.factory.literal(scope);
    this.outputHandler.add(uniqueInternalIdNamedNode, ns.example('scope'), scopeLiteral);

    let minCardinality;
    let maxCardinality;

    if (connector.cardinality.includes('..')) {
      [minCardinality, maxCardinality] = connector.cardinality.split('..');
    } else {
      minCardinality = maxCardinality = connector.cardinality;
    }

    const minCardLiteral = this.factory.literal(minCardinality);
    const maxCardLiteral = this.factory.literal(maxCardinality);
    this.outputHandler.add(uniqueInternalIdNamedNode, ns.shacl('minCount'), minCardLiteral);
    this.outputHandler.add(uniqueInternalIdNamedNode, ns.shacl('maxCount'), maxCardLiteral);

    const parentUri = getTagValue(connector, TagName.ParentUri, null);
    if (parentUri) {
      this.outputHandler.add(uniqueInternalIdNamedNode, ns.rdfs('subPropertyOf'), this.factory.namedNode(parentUri));
    }
  }
}
