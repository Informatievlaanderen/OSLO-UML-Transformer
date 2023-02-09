import { ServiceIdentifier } from '@oslo-flanders/core';
import type { IConfiguration, IGenerationService } from '@oslo-flanders/core';

import { Container } from 'inversify';
import { RdfVocabularyGenerationService } from '../RdfVocabularyGenerationService';
import { RdfVocabularyGenerationServiceConfiguration } from './RdfVocabularyGenerationServiceConfiguration';

export const container = new Container();

container.bind<IConfiguration>(ServiceIdentifier.Configuration)
  .to(RdfVocabularyGenerationServiceConfiguration)
  .inSingletonScope();

container.bind<IGenerationService>(ServiceIdentifier.GenerationService)
  .to(RdfVocabularyGenerationService)
  .inSingletonScope();
