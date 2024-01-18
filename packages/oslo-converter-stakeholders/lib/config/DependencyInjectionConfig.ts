import type { IConfiguration, IService } from '@oslo-flanders/core';
import { ServiceIdentifier } from '@oslo-flanders/core';
import { Container } from 'inversify';
import {
  StakeholdersConversionServiceConfiguration,
} from '@oslo-converter-stakeholders/config/StakeholdersConversionServiceConfiguration';
import { StakeholdersConversionService } from '@oslo-converter-stakeholders/StakeholdersConversionService';

export const container = new Container();

container.bind<IService>(ServiceIdentifier.Service)
  .to(StakeholdersConversionService)
  .inSingletonScope();

container.bind<IConfiguration>(ServiceIdentifier.Configuration)
  .to(StakeholdersConversionServiceConfiguration)
  .inSingletonScope();
