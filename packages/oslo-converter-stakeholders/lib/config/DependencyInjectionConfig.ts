import type { IConfiguration, IConversionService } from '@oslo-flanders/core';
import { ServiceIdentifier } from '@oslo-flanders/core';
import { Container } from 'inversify';
import { StakeholdersConversionService } from '../StakeholdersConversionService';
import { StakeholdersConversionServiceConfiguration } from './StakeholdersConversionServiceConfiguration';

export const container = new Container();

container.bind<IConversionService>(ServiceIdentifier.ConversionService)
  .to(StakeholdersConversionService)
  .inSingletonScope();

container.bind<IConfiguration>(ServiceIdentifier.Configuration)
  .to(StakeholdersConversionServiceConfiguration)
  .inSingletonScope();
