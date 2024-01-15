import 'reflect-metadata';
import type { IConfiguration, IService } from '@oslo-flanders/core';
import type {
  EaAttribute,
  EaElement,
  EaPackage,
  NormalizedConnector,
} from '@oslo-flanders/ea-uml-extractor';
import { Container } from 'inversify';
import { AssociationWithAssociationClassConnectorCase }
  from '../connector-normalisation-cases/AssociationWithAssociationClassConnectorCase';
import { AssociationWithDestinationRoleConnectorCase } from
  '../connector-normalisation-cases/AssociationWithDestinationRoleConnectorCase';
import { AssociationWithNameConnectorCase } from '../connector-normalisation-cases/AssociationWithNameConnectorCase';
import { AssocationWithSourceRoleConnectorCase } from
  '../connector-normalisation-cases/AssociationWithSourceRoleConnectorCase';
import { SelfAssociationWithAssociationClassConnectorCase } from
  '../connector-normalisation-cases/SelfAssociationWithAssociationClassConnectorCase';
import { SelfAssociationWithNameConnectorCase } from
  '../connector-normalisation-cases/SelfAssociationWithNameConnectorCase';
import { ConnectorNormalisationService } from '../ConnectorNormalisationService';
import { AttributeConverterHandler } from '../converter-handlers/AttributeConverterHandler';
import { ConnectorConverterHandler } from '../converter-handlers/ConnectorConverterHandler';
import { ElementConverterHandler } from '../converter-handlers/ElementConverterHandler';
import { PackageConverterHandler } from '../converter-handlers/PackageConverterHandler';
import { EaUmlConversionService } from '../EaUmlConversionService';
import { OutputHandlerService } from '../OutputHandlerService';
import { EaUmlConverterConfiguration } from './EaUmlConverterConfiguration';
import { EaUmlConverterServiceIdentifier } from './EaUmlConverterServiceIdentifier';
import type { ConverterHandler } from '@interfaces/ConverterHandler';

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
