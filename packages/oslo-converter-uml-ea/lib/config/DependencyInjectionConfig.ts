import 'reflect-metadata';
import type { IConfiguration, IService } from '@oslo-flanders/core';
import type {
  EaAttribute,
  EaElement,
  EaPackage,
  NormalizedConnector,
} from '@oslo-flanders/ea-uml-extractor';
import { Container } from 'inversify';
import { EaUmlConverterConfiguration } from '@oslo-converter-uml-ea/config/EaUmlConverterConfiguration';
import { EaUmlConverterServiceIdentifier } from '@oslo-converter-uml-ea/config/EaUmlConverterServiceIdentifier';
import { AssociationWithAssociationClassConnectorCase }
  from '@oslo-converter-uml-ea/connector-normalisation-cases/AssociationWithAssociationClassConnectorCase';
import { AssociationWithDestinationRoleConnectorCase } from
  '@oslo-converter-uml-ea/connector-normalisation-cases/AssociationWithDestinationRoleConnectorCase';
import {
  AssociationWithNameConnectorCase,
} from '@oslo-converter-uml-ea/connector-normalisation-cases/AssociationWithNameConnectorCase';
import { AssocationWithSourceRoleConnectorCase } from
  '@oslo-converter-uml-ea/connector-normalisation-cases/AssociationWithSourceRoleConnectorCase';
import { SelfAssociationWithAssociationClassConnectorCase } from
  '@oslo-converter-uml-ea/connector-normalisation-cases/SelfAssociationWithAssociationClassConnectorCase';
import { SelfAssociationWithNameConnectorCase } from
  '@oslo-converter-uml-ea/connector-normalisation-cases/SelfAssociationWithNameConnectorCase';
import { ConnectorNormalisationService } from '@oslo-converter-uml-ea/ConnectorNormalisationService';
import { AttributeConverterHandler } from '@oslo-converter-uml-ea/converter-handlers/AttributeConverterHandler';
import { ConnectorConverterHandler } from '@oslo-converter-uml-ea/converter-handlers/ConnectorConverterHandler';
import { ElementConverterHandler } from '@oslo-converter-uml-ea/converter-handlers/ElementConverterHandler';
import { PackageConverterHandler } from '@oslo-converter-uml-ea/converter-handlers/PackageConverterHandler';
import { EaUmlConversionService } from '@oslo-converter-uml-ea/EaUmlConversionService';
import type { ConverterHandler } from '@oslo-converter-uml-ea/interfaces/ConverterHandler';
import { OutputHandlerService } from '@oslo-converter-uml-ea/OutputHandlerService';

export const container = new Container();

container
  .bind<IService>(EaUmlConverterServiceIdentifier.Service)
  .to(EaUmlConversionService);
container
  .bind<IConfiguration>(EaUmlConverterServiceIdentifier.Configuration)
  .to(EaUmlConverterConfiguration)
  .inSingletonScope();

container
  .bind<OutputHandlerService>(EaUmlConverterServiceIdentifier.OutputHandlerService)
  .to(OutputHandlerService);

/**
 * Converter handlers
 */
container
  .bind<ConverterHandler<EaPackage>>(EaUmlConverterServiceIdentifier.ConverterHandler)
  .to(PackageConverterHandler)
  .inSingletonScope()
  .whenTargetNamed('PackageConverterHandler');

container
  .bind<ConverterHandler<EaAttribute>>(EaUmlConverterServiceIdentifier.ConverterHandler)
  .to(AttributeConverterHandler)
  .inSingletonScope()
  .whenTargetNamed('AttributeConverterHandler');

container
  .bind<ConverterHandler<EaElement>>(EaUmlConverterServiceIdentifier.ConverterHandler)
  .to(ElementConverterHandler)
  .inSingletonScope()
  .whenTargetNamed('ElementConverterHandler');

container
  .bind<ConverterHandler<NormalizedConnector>>(EaUmlConverterServiceIdentifier.ConverterHandler)
  .to(ConnectorConverterHandler)
  .inSingletonScope()
  .whenTargetNamed('ConnectorConverterHandler');

/**
 * Connector normalisation service and cases
 */
container
  .bind<ConnectorNormalisationService>(EaUmlConverterServiceIdentifier.ConnectorNormalisationService)
  .to(ConnectorNormalisationService)
  .inSingletonScope();

container
  .bind(EaUmlConverterServiceIdentifier.ConnectorNormalisationCase)
  .to(AssociationWithNameConnectorCase)
  .inSingletonScope();

container
  .bind(EaUmlConverterServiceIdentifier.ConnectorNormalisationCase)
  .to(SelfAssociationWithNameConnectorCase)
  .inSingletonScope();

container
  .bind(EaUmlConverterServiceIdentifier.ConnectorNormalisationCase)
  .to(AssocationWithSourceRoleConnectorCase)
  .inSingletonScope();

container
  .bind(EaUmlConverterServiceIdentifier.ConnectorNormalisationCase)
  .to(AssociationWithDestinationRoleConnectorCase)
  .inSingletonScope();

container
  .bind(EaUmlConverterServiceIdentifier.ConnectorNormalisationCase)
  .to(AssociationWithAssociationClassConnectorCase)
  .inSingletonScope();

container
  .bind(EaUmlConverterServiceIdentifier.ConnectorNormalisationCase)
  .to(SelfAssociationWithAssociationClassConnectorCase)
  .inSingletonScope();
