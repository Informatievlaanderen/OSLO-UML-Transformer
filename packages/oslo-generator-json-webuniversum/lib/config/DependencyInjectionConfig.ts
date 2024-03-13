import 'reflect-metadata';
import type { IConfiguration } from '@oslo-core/interfaces/IConfiguration';
import type { IService } from '@oslo-core/interfaces/IService';
import { ServiceIdentifier } from '@oslo-core/ServiceIdentifier';
import { QuadStore } from '@oslo-core/store/QuadStore';
import { Container } from 'inversify';
import { JsonWebuniversumGenerationServiceConfiguration }
    from '@oslo-generator-json-webuniversum/config/JsonWebuniversumGenerationServiceConfiguration';
import { JsonWebuniversumGenerationService } from '@oslo-generator-json-webuniversum/JsonWebuniversumGenerationService';

export const container = new Container();

container.bind<IService>(ServiceIdentifier.Service)
    .to(JsonWebuniversumGenerationService)
    .inSingletonScope();

container.bind<IConfiguration>(ServiceIdentifier.Configuration)
    .to(JsonWebuniversumGenerationServiceConfiguration)
    .inSingletonScope();

container.bind<QuadStore>(ServiceIdentifier.QuadStore)
    .to(QuadStore);