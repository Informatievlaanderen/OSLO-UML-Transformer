import "reflect-metadata";
import { IConfiguration, IConversionService } from "@oslo-flanders/core";
import { EaAttribute, EaElement, EaPackage } from "@oslo-flanders/ea-uml-extractor";
import { Container } from "inversify";
import { AttributeConverterHandler } from "../converterHandlers/AttributeConverterHandler";
import { ElementConverterHandler } from "../converterHandlers/ElementConverterHandler";
import { PackageConverterHandler } from "../converterHandlers/PackageConverterHandler";
import { IConverterHandler } from "../interfaces/IConverterHandler";
import { EaUmlConversionService } from "../EaUmlConversionService";
import { EaUmlConverterConfiguration } from "./EaUmlConverterConfiguration";
import { ServiceIdentifier } from "./ServiceIdentifier";

export const container = new Container();

container.bind<IConversionService>(ServiceIdentifier.ConversionService).to(EaUmlConversionService);
container.bind<IConfiguration>(ServiceIdentifier.UmlConverterConfiguration).to(EaUmlConverterConfiguration).inSingletonScope();

container.bind<IConverterHandler<EaPackage>>(ServiceIdentifier.ConverterHandler).to(PackageConverterHandler).whenTargetNamed('PackageConverterHandler');
container.bind<IConverterHandler<EaAttribute>>(ServiceIdentifier.ConverterHandler).to(AttributeConverterHandler).whenTargetNamed('AttributeConverterHandler');
container.bind<IConverterHandler<EaElement>>(ServiceIdentifier.ConverterHandler).to(ElementConverterHandler).whenTargetNamed('ElementConverterHandler');