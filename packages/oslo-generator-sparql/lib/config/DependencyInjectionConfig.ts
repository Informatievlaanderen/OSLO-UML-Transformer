import { QuadStore, ServiceIdentifier } from '@oslo-flanders/core';
import type { IConfiguration, IService } from '@oslo-flanders/core';

import { Container } from 'inversify';
import { SparqlGenerationService } from '../SparqlGenerationService';
import {
  SparqlGenerationServiceConfiguration,
} from './SparqlGenerationServiceConfiguration';

export const container = new Container();

container.bind<IConfiguration>(ServiceIdentifier.Configuration)
  .to(SparqlGenerationServiceConfiguration)
  .inSingletonScope();

container.bind<IService>(ServiceIdentifier.Service)
  .to(SparqlGenerationService)
  .inSingletonScope();

container.bind<QuadStore>(ServiceIdentifier.QuadStore)
  .to(QuadStore);
