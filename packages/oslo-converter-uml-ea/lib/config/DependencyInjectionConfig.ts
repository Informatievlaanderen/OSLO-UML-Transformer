import 'reflect-metadata';
import type { IConfiguration, IService } from '@oslo-flanders/core';
import type {
  EaAttribute,
  EaElement,
  EaPackage,
  NormalizedConnector,
} from '@oslo-flanders/ea-uml-extractor';
import { Container } from 'inversify';
import { AttributeConverterHandler } from '../converter-handlers/AttributeConverterHandler';
import { ConnectorConverterHandler } from '../converter-handlers/ConnectorConverterHandler';
import { ElementConverterHandler } from '../converter-handlers/ElementConverterHandler';
import { PackageConverterHandler } from '../converter-handlers/PackageConverterHandler';
import { EaUmlConversionService } from '../EaUmlConversionService';
import type { ConverterHandler } from '../interfaces/ConverterHandler';
import { OutputHandlerService } from '../OutputHandlerService';
import { EaUmlConverterConfiguration } from './EaUmlConverterConfiguration';
import { EaUmlConverterServiceIdentifier } from './EaUmlConverterServiceIdentifier';

export const container = new Container();

container
  .bind<IService>(EaUmlConverterServiceIdentifier.Service)
  .to(EaUmlConversionService);
container
  .bind<IConfiguration>(EaUmlConverterServiceIdentifier.Configuration)
  .to(EaUmlConverterConfiguration)
  .inSingletonScope();

container
  .bind<OutputHandlerService>(
  EaUmlConverterServiceIdentifier.OutputHandlerService,
)
  .to(OutputHandlerService);

container
  .bind<ConverterHandler<EaPackage>>(
  EaUmlConverterServiceIdentifier.ConverterHandler,
)
  .to(PackageConverterHandler)
  .inSingletonScope()
  .whenTargetNamed('PackageConverterHandler');

container
  .bind<ConverterHandler<EaAttribute>>(
  EaUmlConverterServiceIdentifier.ConverterHandler,
)
  .to(AttributeConverterHandler)
  .inSingletonScope()
  .whenTargetNamed('AttributeConverterHandler');

container
  .bind<ConverterHandler<EaElement>>(
  EaUmlConverterServiceIdentifier.ConverterHandler,
)
  .to(ElementConverterHandler)
  .inSingletonScope()
  .whenTargetNamed('ElementConverterHandler');

container
  .bind<ConverterHandler<NormalizedConnector>>(
  EaUmlConverterServiceIdentifier.ConverterHandler,
)
  .to(ConnectorConverterHandler)
  .inSingletonScope()
  .whenTargetNamed('ConnectorConverterHandler');
