/* eslint-disable eslint-comments/disable-enable-pair */
 
import { Logger, ns } from '@oslo-flanders/core';
import type { QuadStore, IService } from '@oslo-flanders/core';
import { DataRegistry } from '@oslo-flanders/ea-uml-extractor';
import { inject, injectable } from 'inversify';
import { DataFactory } from 'rdf-data-factory';
import { EaUmlConverterConfiguration } from './config/EaUmlConverterConfiguration';
import { EaUmlConverterServiceIdentifier } from './config/EaUmlConverterServiceIdentifier';
import { ConverterHandlerService } from './ConverterHandlerService';
import { OutputHandlerService } from './OutputHandlerService';

@injectable()
export class EaUmlConversionService implements IService {
  public readonly logger: Logger;
  public readonly configuration: EaUmlConverterConfiguration;
  public readonly outputHandlerService: OutputHandlerService;

  public constructor(
    @inject(EaUmlConverterServiceIdentifier.Logger) logger: Logger,
    @inject(EaUmlConverterServiceIdentifier.Configuration) config: EaUmlConverterConfiguration,
    @inject(EaUmlConverterServiceIdentifier.OutputHandlerService) outputHandlerService: OutputHandlerService,
  ) {
    this.logger = logger;
    this.configuration = config;
    this.outputHandlerService = outputHandlerService;
  }

  public async init(): Promise<void> {
    // Nothing to init here
  }

  public async run(): Promise<void> {
    const model = new DataRegistry(this.logger);
    const converterHandler = new ConverterHandlerService(this.logger);

    await model.extract(this.configuration.umlFile);
    model.setTargetDiagram(this.configuration.diagramName);

    const store = await converterHandler.filterIgnoredObjects(model)
      .then(() => converterHandler.normalize(model))
      .then(() => converterHandler.assignUris(model))
      .then(uriRegistry => converterHandler.convert(model, uriRegistry))
      .then(_store => this.addDocumentInformation(_store));

    await this.outputHandlerService.write(store);
  }

  private async addDocumentInformation(store: QuadStore): Promise<QuadStore> {
    const df = new DataFactory();
    const normalizedVersionBaseUri = this.configuration.publicationEnvironment.endsWith('/') ?
      this.configuration.publicationEnvironment.slice(0, -1) :
      this.configuration.publicationEnvironment;
    const versionUri = `${normalizedVersionBaseUri}/${this.configuration.versionId}`;

    // The output handler will use this quad to set the id of the document
    store.addQuad(
      df.quad(
        df.namedNode(versionUri),
        ns.prov('generatedAtTime'),
        df.literal(new Date(Date.now()).toISOString(), ns.xsd('datetime')),
      ),
    );

    return store;
  }
}
