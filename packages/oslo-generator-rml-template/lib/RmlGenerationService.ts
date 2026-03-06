// RmlGenerationService.ts
import type { IService } from '@oslo-flanders/core';
import { QuadStore, Logger } from '@oslo-flanders/core';
import { readFileSync } from 'fs';
import { inject, injectable } from 'inversify';
import { RmlGenerationServiceConfiguration } from './config/RmlGenerationServiceConfiguration';
import type { RmlMappingConfig } from './types/Rml';
import { RmlGenerationServiceIdentifier } from './config/RmlGenerationServiceIdentifier';
import { OutputHandlerService } from './OutputHandlerService';
import { replaceVariables } from './utils/replaceVariables';
import { MappingGeneratorService } from './services/MappingGeneratorService';
import { MappingWriterService } from './services/MappingWriterService';

@injectable()
export class RmlGenerationService implements IService {
  public readonly logger: Logger;
  public readonly configuration: RmlGenerationServiceConfiguration;
  private readonly store: QuadStore;
  private readonly outputHandlerService: OutputHandlerService;
  private mapping: RmlMappingConfig | undefined;
  private _rmlStore: QuadStore | undefined;

  public constructor(
    @inject(RmlGenerationServiceIdentifier.Logger) logger: Logger,
    @inject(RmlGenerationServiceIdentifier.Configuration)
    config: RmlGenerationServiceConfiguration,
    @inject(RmlGenerationServiceIdentifier.QuadStore) store: QuadStore,
    @inject(RmlGenerationServiceIdentifier.OutputHandlerService)
    outputHandlerService: OutputHandlerService,
  ) {
    this.logger = logger;
    this.configuration = config;
    this.store = store;
    this.mapping = { variables: [], datasources: {} };
    this.outputHandlerService = outputHandlerService;
  }

  public async init(): Promise<void> {
    this.mapping = JSON.parse(
      readFileSync(this.configuration.mapping).toString(),
    );
    return this.store.addQuadsFromFile(this.configuration.input);
  }

  public async run(): Promise<void> {
    const generator = new MappingGeneratorService(
      this.store,
      this.logger,
      this.configuration.language,
      this.configuration.baseIRI,
    );

    const { mappings, parentTriplesMaps } = await generator.generateMappings();
    replaceVariables(mappings, this.mapping);

    const writer = new MappingWriterService(
      this.logger,
      this.outputHandlerService,
      this.mapping,
    );
    writer.writeMappings(mappings);
    this._rmlStore = writer.rmlStore;
  }
  public get rmlStore(): QuadStore | undefined {
    return this._rmlStore;
  }
}
