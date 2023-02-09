import type { IGenerationService } from '@oslo-flanders/core';
import { createN3Store, Logger, ServiceIdentifier } from '@oslo-flanders/core';

import { inject, injectable } from 'inversify';
import { RdfVocabularyGenerationServiceConfiguration } from './config/RdfVocabularyGenerationServiceConfiguration';
const streamifyArray = require('streamify-array');

@injectable()
export class RdfVocabularyGenerationService implements IGenerationService {
  public readonly logger: Logger;
  public readonly configuration: RdfVocabularyGenerationServiceConfiguration;

  public constructor(
    @inject(ServiceIdentifier.Logger) logger: Logger,
    @inject(ServiceIdentifier.Configuration) config: RdfVocabularyGenerationServiceConfiguration,
  ) {
    this.logger = logger;
    this.configuration = config;
  }

  public async run(): Promise<void> {
    const store = await createN3Store(this.configuration.input);
  }
}
