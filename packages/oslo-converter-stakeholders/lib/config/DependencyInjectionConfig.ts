import type { IConfiguration, IService } from '@oslo-flanders/core';
import { ServiceIdentifier } from '@oslo-flanders/core';
import { Container } from 'inversify';
import { StakeholdersConversionService } from '../StakeholdersConversionService';
import { StakeholdersConversionServiceConfiguration } from './StakeholdersConversionServiceConfiguration';

export const container = new Container();

container.bind<IService>(ServiceIdentifier.Service)
  .to(StakeholdersConversionService)
  .inSingletonScope();

container.bind<IConfiguration>(ServiceIdentifier.Configuration)
  .to(StakeholdersConversionServiceConfiguration)
  .inSingletonScope();
