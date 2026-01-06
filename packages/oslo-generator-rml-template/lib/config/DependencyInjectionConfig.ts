import { QuadStore, ServiceIdentifier } from '@oslo-flanders/core';
import type { IConfiguration, IService } from '@oslo-flanders/core';

import { Container } from 'inversify';
import { OutputHandlerService } from '../OutputHandlerService';
import { RmlGenerationService } from '../RmlGenerationService';
import { RmlGenerationServiceConfiguration } from './RmlGenerationServiceConfiguration';
import { RmlGenerationServiceIdentifier } from './RmlGenerationServiceIdentifier';

export const container = new Container();

container
  .bind<IConfiguration>(ServiceIdentifier.Configuration)
  .to(RmlGenerationServiceConfiguration)
  .inSingletonScope();

container
  .bind<IService>(ServiceIdentifier.Service)
  .to(RmlGenerationService)
  .inSingletonScope();

container.bind<QuadStore>(ServiceIdentifier.QuadStore).to(QuadStore);

container
  .bind<OutputHandlerService>(
    RmlGenerationServiceIdentifier.OutputHandlerService,
  )
  .to(OutputHandlerService)
  .inSingletonScope();
