import 'reflect-metadata';
import type { IConfiguration, IService } from '@oslo-flanders/core';
import { QuadStore, ServiceIdentifier } from '@oslo-flanders/core';

import { Container } from 'inversify';
import { HtmlRespecGenerationService } from '../HtmlRespecGenerationService';
import { HtmlRespecGenerationServiceConfiguration } from './HtmlRespecGenerationServiceConfiguration';

export const container = new Container();

container.bind<IService>(ServiceIdentifier.Service)
  .to(HtmlRespecGenerationService)
  .inSingletonScope();

container.bind<IConfiguration>(ServiceIdentifier.Configuration)
  .to(HtmlRespecGenerationServiceConfiguration)
  .inSingletonScope();

container.bind<QuadStore>(ServiceIdentifier.QuadStore)
  .to(QuadStore);
