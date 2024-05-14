import 'reflect-metadata';
import type { IConfiguration, IService } from '@oslo-flanders/core';
import { QuadStore, ServiceIdentifier } from '@oslo-flanders/core';

import { Container } from 'inversify';
import { JsonldContextGenerationService } from '../JsonldContextGenerationService';
import {
  JsonldContextGenerationServiceConfiguration,
} from './JsonldContextGenerationServiceConfiguration';

export const container = new Container();

container.bind<IService>(ServiceIdentifier.Service)
  .to(JsonldContextGenerationService)
  .inSingletonScope();

container.bind<IConfiguration>(ServiceIdentifier.Configuration)
  .to(JsonldContextGenerationServiceConfiguration)
  .inSingletonScope();

container.bind<QuadStore>(ServiceIdentifier.QuadStore)
  .to(QuadStore);
