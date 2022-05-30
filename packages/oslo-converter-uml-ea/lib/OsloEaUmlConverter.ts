import type { OsloEaConverterConfiguration } from '@oslo-flanders/configuration';
import { Converter } from '@oslo-flanders/core';
import type { EaAttribute, EaConnector, EaDiagram, EaElement, EaPackage } from '@oslo-flanders/ea-uml-extractor';
import { ConnectorType, UmlDataExtractor } from '@oslo-flanders/ea-uml-extractor';

import { ConverterHandlerMediator } from './ConverterHandlerMediator';
import { NormalizedConnectorType } from './enums/NormalizedConnectorType';
import type { NormalizedConnector } from './types/NormalizedConnector';
import { UriAssigner } from './UriAssigner';
import { ignore, normalize } from './utils/utils';

export class OsloEaUmlConverter extends Converter<OsloEaConverterConfiguration> {
  private readonly extractor: UmlDataExtractor;
  private readonly converterHandlerMediator: ConverterHandlerMediator;
  private normalizedConnectors: NormalizedConnector[];

  public constructor() {
    super();
    this.extractor = new UmlDataExtractor();
    this.converterHandlerMediator = new ConverterHandlerMediator(this);

    this.normalizedConnectors = [];
  }

  public async convert(): Promise<void> {
    await this.extractor.extractData(this.configuration.umlFile);
    this.extractor.setTargetDiagram(this.configuration.diagramName);

    this.normalizeConnectors(this.extractor.connectors);

    const uriAssigner = new UriAssigner();
    await uriAssigner.assignUris(
      this.getTargetDiagram(),
      this.getPackages(),
      this.getElements(),
      this.getAttributes(),
      this.getConnectors(),
    );

    this.converterHandlerMediator.configureHandlers(this.configuration, this.outputHandler, uriAssigner);

    await this.converterHandlerMediator.addObjectsToOutput()
      .then(() => this.outputHandler.write(this.configuration.outputFile));
  }

  private normalizeConnectors(connectors: EaConnector[]): void {
    const normalizedConnectors: NormalizedConnector[] = [];
    const elements = this.getElements();

    connectors.forEach(connector => {
      const normalized = normalize(connector, elements);
      normalizedConnectors.push(...normalized);
    });

    // Add names for the association class connectors
    normalizedConnectors.forEach(connector => {
      if (connector.type === NormalizedConnectorType.AssociationClassConnector) {
        const destinationClass = elements.find(x => x.id === connector.destinationObjectId);

        if (!destinationClass) {
          this.logger.warn(`Can not find corresponding object for connector with id '${connector.destinationObjectId}'. Path for this connector is ${connector.path}`);
        } else {
          connector.addNameTag(destinationClass.name);
        }
      }
    });

    this.normalizedConnectors = normalizedConnectors;
  }

  public getPackages(): EaPackage[] {
    return this.extractor.packages.filter(x => !ignore(x));
  }

  public getAttributes(): EaAttribute[] {
    return this.extractor.attributes.filter(x => !ignore(x));
  }

  public getElements(): EaElement[] {
    return this.extractor.elements.filter(x => !ignore(x));
  }

  public getGeneralizationConnectors(): EaConnector[] {
    return this.extractor.connectors.filter(x => x.type === ConnectorType.Generalization);
  }

  public getConnectors(): NormalizedConnector[] {
    return this.normalizedConnectors;
  }

  public getTargetDiagram(): EaDiagram {
    return this.extractor.targetDiagram;
  }
}
