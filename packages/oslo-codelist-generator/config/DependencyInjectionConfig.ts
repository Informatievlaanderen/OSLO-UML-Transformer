import type { IConfiguration, IService } from '@oslo-flanders/core';
import { QuadStore, ServiceIdentifier } from '@oslo-flanders/core';
import { Container } from 'inversify';
import { CodelistGenerationService } from '../lib/CodelistGenerationService';
import { CodelistGenerationServiceConfiguration } from './CodelistGenerationServiceConfiguration';

export const container = new Container();

container
  .bind<IService>(ServiceIdentifier.Service)
  .to(CodelistGenerationService)
  .inSingletonScope();

container
  .bind<IConfiguration>(ServiceIdentifier.Configuration)
  .to(CodelistGenerationServiceConfiguration)
  .inSingletonScope();

container.bind<QuadStore>(ServiceIdentifier.QuadStore).to(QuadStore);
