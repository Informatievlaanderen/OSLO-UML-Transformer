import { QuadStore, ServiceIdentifier } from '@oslo-flanders/core';
import type { IConfiguration, IService } from '@oslo-flanders/core';

import { Container } from 'inversify';
import { MarkdownGenerationService } from '../MarkdownGenerationService';
import {
  MarkdownGenerationServiceConfiguration,
} from './MarkdownGenerationServiceConfiguration';

export const container = new Container();

container.bind<IConfiguration>(ServiceIdentifier.Configuration)
  .to(MarkdownGenerationServiceConfiguration)
  .inSingletonScope();

container.bind<IService>(ServiceIdentifier.Service)
  .to(MarkdownGenerationService)
  .inSingletonScope();

container.bind<QuadStore>(ServiceIdentifier.QuadStore)
  .to(QuadStore);
