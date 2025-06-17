import 'reflect-metadata';
import type { IConfiguration, IService } from '@oslo-flanders/core';
import { QuadStore, ServiceIdentifier } from '@oslo-flanders/core';

import { Container } from 'inversify';
import { StakeholdersValidationService } from '../StakeholdersValidationService.js';
import { StakeholdersValidationServiceConfiguration } from './StakeholdersValidationServiceConfiguration.js';

export const container = new Container();

container
  .bind<IService>(ServiceIdentifier.Service)
  .to(StakeholdersValidationService)
  .inSingletonScope();

container
  .bind<IConfiguration>(ServiceIdentifier.Configuration)
  .to(StakeholdersValidationServiceConfiguration)
  .inSingletonScope();

container.bind<QuadStore>(ServiceIdentifier.QuadStore).to(QuadStore);
