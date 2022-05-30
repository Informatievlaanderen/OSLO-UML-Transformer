import type { OsloEaConverterConfiguration } from '@oslo-flanders/configuration';
import type { OutputHandler } from '@oslo-flanders/core';
import type { EaConnector, EaDiagram, EaElement, EaObject } from '@oslo-flanders/ea-uml-extractor';
import { AttributeConverterHandler } from './converterHandlers/AttributeConverterHandler';
import { ConnectorConverterHandler } from './converterHandlers/ConnectorConverterHandler';
import { ElementConverterHandler } from './converterHandlers/ElementConverterHandler';
import { PackageConverterHandler } from './converterHandlers/PackageConverterHandler';
import type { RequestType } from './enums/RequestType';
import type { OsloEaUmlConverter } from './OsloEaUmlConverter';
import type { UriAssigner } from './UriAssigner';

export class ConverterHandlerMediator {
  private readonly converter: OsloEaUmlConverter;

  private readonly packageConverterHandler: PackageConverterHandler;
  private readonly elementConverterHandler: ElementConverterHandler;
  private readonly attributeConverterHandler: AttributeConverterHandler;
  private readonly connectorConverterHandler: ConnectorConverterHandler;

  public constructor(converter: OsloEaUmlConverter) {
    this.converter = converter;
    this.packageConverterHandler = new PackageConverterHandler(this);
    this.elementConverterHandler = new ElementConverterHandler(this);
    this.attributeConverterHandler = new AttributeConverterHandler(this);
    this.connectorConverterHandler = new ConnectorConverterHandler(this);

    this.packageConverterHandler
      .setNextConverterHandler(this.elementConverterHandler)
      .setNextConverterHandler(this.attributeConverterHandler)
      .setNextConverterHandler(this.connectorConverterHandler);
  }

  public async notify(requestType: RequestType, object: EaObject): Promise<void> {
    return this.packageConverterHandler.handleRequest(requestType, object);
  }

  public configureHandlers(
    config: OsloEaConverterConfiguration,
    outputHandler: OutputHandler,
    uriAssigner: UriAssigner,
  ): void {
    [
      this.packageConverterHandler,
      this.elementConverterHandler,
      this.attributeConverterHandler,
      this.connectorConverterHandler,
    ].forEach(x => {
      x.outputHandler = outputHandler;
      x.uriAssigner = uriAssigner;
      x.specificationType = config.specificationType;
      x.targetDomain = config.targetDomain;
    });
  }

  public async addObjectsToOutput(): Promise<void> {
    const targetDiagram = this.converter.getTargetDiagram();

    await Promise.all([
      this.handlePackages(targetDiagram),
      this.handleElements(targetDiagram),
    ]);

    await Promise.all([
      this.handleAttributes(targetDiagram),
      this.handleConnectors(targetDiagram),
    ]);
  }

  private async handlePackages(targetDiagram: EaDiagram): Promise<void> {
    // Only package from target diagram is added
    const targetPackage = this.converter.getPackages()
      .find(x => x.packageId === targetDiagram.packageId)!;

    await this.packageConverterHandler
      .addObjectToOutput(targetPackage);
  }

  private async handleElements(targetDiagram: EaDiagram): Promise<void> {
    // All elements will be processed and receive a URI, but only elements on the target diagram
    // will be passed to the OutputHandler. This flow is necessary because element types could be
    // in other packages and their URIs are needed to refer to in the output file.If filtering
    // would be applied in documentNotification, external types would not have an URI.
    const diagramElements = this.converter.getElements().filter(x => targetDiagram.elementIds.includes(x.id));

    diagramElements.forEach(x =>
      this.elementConverterHandler.addObjectToOutput(x, targetDiagram));
  }

  private async handleAttributes(targetDiagram: EaDiagram): Promise<void> {
    const diagramAttributes = this.converter.getAttributes()
      .filter(x => targetDiagram.elementIds.includes(x.classId));

    diagramAttributes.forEach(x =>
      this.attributeConverterHandler.addObjectToOutput(x, targetDiagram));
  }

  private async handleConnectors(targetDiagram: EaDiagram): Promise<void> {
    const diagramConnectors = this.converter.getConnectors()
      .filter(x => targetDiagram.connectorsIds.includes(x.innerConnectorId));

    diagramConnectors.forEach(x =>
      this.connectorConverterHandler.addObjectToOutput(x, targetDiagram));
  }

  public get targetDiagram(): EaDiagram {
    return this.converter.getTargetDiagram();
  }

  public getParentClasses(classId: number): EaConnector[] {
    return this.converter.getGeneralizationConnectors().filter(x => x.sourceObjectId === classId);
  }

  public getElements(): EaElement[] {
    return this.converter.getElements();
  }
}
