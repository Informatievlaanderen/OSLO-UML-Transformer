import { QuadStore, ServiceIdentifier } from '@oslo-flanders/core';
import type { IConfiguration, IService } from '@oslo-flanders/core';

import { Container } from 'inversify';
import { SwaggerGenerationService } from '../SwaggerGenerationService';
import {
  SwaggerGenerationServiceConfiguration,
} from './SwaggerGenerationServiceConfiguration';

export const container = new Container();

container.bind<IConfiguration>(ServiceIdentifier.Configuration)
  .to(SwaggerGenerationServiceConfiguration)
  .inSingletonScope();

container.bind<IService>(ServiceIdentifier.Service)
  .to(SwaggerGenerationService)
  .inSingletonScope();

container.bind<QuadStore>(ServiceIdentifier.QuadStore)
  .to(QuadStore);
