import 'reflect-metadata';
import type { IConfiguration, IService } from '@oslo-flanders/core';
import { QuadStore, ServiceIdentifier } from '@oslo-flanders/core';

import { Container } from 'inversify';
import { HtmlGenerationService } from '../HtmlGenerationService';
import { HtmlGenerationServiceConfiguration } from './HtmlGenerationServiceConfiguration';

export const container = new Container();

container
  .bind<IService>(ServiceIdentifier.Service)
  .to(HtmlGenerationService)
  .inSingletonScope();

container
  .bind<IConfiguration>(ServiceIdentifier.Configuration)
  .to(HtmlGenerationServiceConfiguration)
  .inSingletonScope();

container.bind<QuadStore>(ServiceIdentifier.QuadStore).to(QuadStore);
