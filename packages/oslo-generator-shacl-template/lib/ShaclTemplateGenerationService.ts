import { IService, Logger, QuadStore, ServiceIdentifier } from "@oslo-flanders/core";
import { ShaclTemplateGenerationServiceConfiguration } from "./config/ShaclTemplateGenerationServiceConfiguration";
import { inject, injectable } from "inversify";

@injectable()
export class ShaclTemplateGenerationService implements IService {
  public readonly logger: Logger;
  public readonly configuration: ShaclTemplateGenerationServiceConfiguration;
  public readonly store: QuadStore;

  public constructor(
    @inject(ServiceIdentifier.Logger) logger: Logger,
    @inject(ServiceIdentifier.Configuration) config: ShaclTemplateGenerationServiceConfiguration,
    @inject(ServiceIdentifier.QuadStore) store: QuadStore,
  ) {
    this.logger = logger;
    this.configuration = config;
    this.store = store;
  }

  public async init(): Promise<void> {
    return this.store.addQuadsFromFile(this.configuration.input);
  }

  public async run(): Promise<void> {
    
   }

}