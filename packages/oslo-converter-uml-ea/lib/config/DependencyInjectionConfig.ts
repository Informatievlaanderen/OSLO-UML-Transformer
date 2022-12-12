import 'reflect-metadata';
import type { IConfiguration, IConversionService } from '@oslo-flanders/core';
import type { EaAttribute, EaElement, EaPackage, NormalizedConnector } from '@oslo-flanders/ea-uml-extractor';
import { Container } from 'inversify';
import { AttributeConverterHandler } from '../converterHandlers/AttributeConverterHandler';
import { ConnectorConverterHandler } from '../converterHandlers/ConnectorConverterHandler';
import { ElementConverterHandler } from '../converterHandlers/ElementConverterHandler';
import { PackageConverterHandler } from '../converterHandlers/PackageConverterHandler';
import { EaUmlConversionService } from '../EaUmlConversionService';
import type { ConverterHandler } from '../interfaces/ConverterHandler';
import { OutputHandlerService } from '../OutputHandlerService';
import { EaUmlConverterConfiguration } from './EaUmlConverterConfiguration';
import { EaUmlConverterServiceIdentifier } from './EaUmlConverterServiceIdentifier';

export const container = new Container();

container.bind<IConversionService>(EaUmlConverterServiceIdentifier.ConversionService).to(EaUmlConversionService);
container.bind<IConfiguration>(EaUmlConverterServiceIdentifier.Configuration)
  .to(EaUmlConverterConfiguration)
  .inSingletonScope();

container.bind<OutputHandlerService>(EaUmlConverterServiceIdentifier.OutputHandlerService).to(OutputHandlerService);

container.bind<ConverterHandler<EaPackage>>(EaUmlConverterServiceIdentifier.ConverterHandler)
  .to(PackageConverterHandler)
  .inSingletonScope()
  .whenTargetNamed('PackageConverterHandler');

container.bind<ConverterHandler<EaAttribute>>(EaUmlConverterServiceIdentifier.ConverterHandler)
  .to(AttributeConverterHandler)
  .inSingletonScope()
  .whenTargetNamed('AttributeConverterHandler');

container.bind<ConverterHandler<EaElement>>(EaUmlConverterServiceIdentifier.ConverterHandler)
  .to(ElementConverterHandler)
  .inSingletonScope()
  .whenTargetNamed('ElementConverterHandler');

container.bind<ConverterHandler<NormalizedConnector>>(EaUmlConverterServiceIdentifier.ConverterHandler)
  .to(ConnectorConverterHandler)
  .inSingletonScope()
  .whenTargetNamed('ConnectorConverterHandler');
