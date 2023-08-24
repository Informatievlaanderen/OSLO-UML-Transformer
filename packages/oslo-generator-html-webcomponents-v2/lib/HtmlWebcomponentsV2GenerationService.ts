import { IConfiguration, IService, Logger, QuadStore, ServiceIdentifier } from "@oslo-flanders/core";
import { inject, injectable } from "inversify";
import { HtmlWebcomponentsV2GenerationServiceConfiguration } from "./config/HtmlWebcomponentsV2GenerationServiceConfiguration";

@injectable()
export class HtmlWebcomponentsV2GenerationService implements IService {
  public readonly logger: Logger;
  public readonly configuration: HtmlWebcomponentsV2GenerationServiceConfiguration;
  public readonly store: QuadStore

  public constructor(
    @inject(ServiceIdentifier.Logger) logger: Logger,
    @inject(ServiceIdentifier.Configuration)
    config: HtmlWebcomponentsV2GenerationServiceConfiguration,
    @inject(ServiceIdentifier.QuadStore) store: QuadStore
  ) {
    this.logger = logger;
    this.configuration = config;
    this.store = store;
  }

  public async init(): Promise<void> {
    return this.store.addQuadsFromFile(this.configuration.input);
  }

  public async run(): Promise<void> {}
}