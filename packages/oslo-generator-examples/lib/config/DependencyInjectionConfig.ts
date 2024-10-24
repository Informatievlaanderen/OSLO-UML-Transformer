import 'reflect-metadata';
import type { IConfiguration, IService } from '@oslo-flanders/core';
import { QuadStore, ServiceIdentifier } from '@oslo-flanders/core';

import { Container } from 'inversify';
import { ExamplesGenerationService } from '../ExamplesGenerationService';
import { ExamplesGenerationServiceConfiguration } from './ExamplesGenerationServiceConfiguration';

export const container = new Container();

container
  .bind<IService>(ServiceIdentifier.Service)
  .to(ExamplesGenerationService)
  .inSingletonScope();

container
  .bind<IConfiguration>(ServiceIdentifier.Configuration)
  .to(ExamplesGenerationServiceConfiguration)
  .inSingletonScope();

container.bind<QuadStore>(ServiceIdentifier.QuadStore).to(QuadStore);
