import 'reflect-metadata';
import { ServiceIdentifier, QuadStore } from '@oslo-flanders/core';
import type { IService, IConfiguration } from '@oslo-flanders/core';
import { Container } from 'inversify';
import { JsonWebuniversumGenerationService } from '../JsonWebuniversumGenerationService';
import { JsonWebuniversumGenerationServiceConfiguration }
    from './JsonWebuniversumGenerationServiceConfiguration';

export const container = new Container();

container.bind<IService>(ServiceIdentifier.Service)
    .to(JsonWebuniversumGenerationService)
    .inSingletonScope();

container.bind<IConfiguration>(ServiceIdentifier.Configuration)
    .to(JsonWebuniversumGenerationServiceConfiguration)
    .inSingletonScope();

container.bind<QuadStore>(ServiceIdentifier.QuadStore)
    .to(QuadStore);