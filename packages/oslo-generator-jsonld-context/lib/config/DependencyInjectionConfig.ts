import 'reflect-metadata';
import type { IConfiguration, IGenerationService } from '@oslo-flanders/core';
import { ServiceIdentifier } from '@oslo-flanders/core';
import { Container } from 'inversify';
import { JsonldContextGenerationService } from '../JsonldContextGenerationService';
import { JsonldContextGenerationServiceConfiguration } from './JsonldContextGenerationServiceConfiguration';

export const container = new Container();

container.bind<IGenerationService>(ServiceIdentifier.GenerationService)
  .to(JsonldContextGenerationService)
  .inSingletonScope();

container.bind<IConfiguration>(ServiceIdentifier.Configuration)
  .to(JsonldContextGenerationServiceConfiguration)
  .inSingletonScope();
