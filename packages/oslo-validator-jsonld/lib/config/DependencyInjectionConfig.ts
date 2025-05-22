import 'reflect-metadata';
import type { IConfiguration, IService } from '@oslo-flanders/core';
import { QuadStore, ServiceIdentifier } from '@oslo-flanders/core';

import { Container } from 'inversify';
import { JsonldValidationService } from '../JsonldValidationService';
import { JsonldValidationServiceConfiguration } from './JsonldValidationServiceConfiguration';

export const container = new Container();

container
  .bind<IService>(ServiceIdentifier.Service)
  .to(JsonldValidationService)
  .inSingletonScope();

container
  .bind<IConfiguration>(ServiceIdentifier.Configuration)
  .to(JsonldValidationServiceConfiguration)
  .inSingletonScope();

container.bind<QuadStore>(ServiceIdentifier.QuadStore).to(QuadStore);
