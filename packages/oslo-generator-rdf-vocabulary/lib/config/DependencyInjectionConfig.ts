import { QuadStore, ServiceIdentifier } from '@oslo-flanders/core';
import type { IConfiguration, IService } from '@oslo-flanders/core';

import { Container } from 'inversify';
import { RdfVocabularyGenerationService } from '../RdfVocabularyGenerationService';
import { RdfVocabularyGenerationServiceConfiguration } from './RdfVocabularyGenerationServiceConfiguration';

export const container = new Container();

container.bind<IConfiguration>(ServiceIdentifier.Configuration)
  .to(RdfVocabularyGenerationServiceConfiguration)
  .inSingletonScope();

container.bind<IService>(ServiceIdentifier.Service)
  .to(RdfVocabularyGenerationService)
  .inSingletonScope();

container.bind<QuadStore>(ServiceIdentifier.QuadStore)
  .to(QuadStore);
