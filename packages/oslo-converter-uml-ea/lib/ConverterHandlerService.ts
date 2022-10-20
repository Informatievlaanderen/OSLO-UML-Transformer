import { DataRegistry } from "@oslo-flanders/ea-uml-extractor";
import { container } from "./config/DependencyInjectionConfig";
import { ServiceIdentifier } from "@oslo-flanders/core/lib/ServiceIdentifier";
import { IConverterHandler } from "./interfaces/IConverterHandler";
import { UriRegistry } from "./UriRegistry";
import * as N3 from 'n3';
import { EaUmlConverterServiceIdentifier } from "./config/EaUmlConverterServiceIdentifier";

export class ConverterHandlerService<T> {
  public async normalize(model: DataRegistry): Promise<DataRegistry> {
    container.getAll<IConverterHandler<T>>(EaUmlConverterServiceIdentifier.ConverterHandler)
      .forEach(handler => handler.normalize(model))

    return model;
  }

  public async assignUris(model: DataRegistry, uriRegistry: UriRegistry): Promise<UriRegistry> {
    const packageConverterHandler = container.getNamed<IConverterHandler<T>>(EaUmlConverterServiceIdentifier.ConverterHandler, 'PackageConverterHandler');
    await packageConverterHandler.assignUris(model, uriRegistry);

    const otherHandlers = container.getAll<IConverterHandler<T>>(EaUmlConverterServiceIdentifier.ConverterHandler)
      .filter(x => x.constructor.name !== 'PackageConverterHandler');

    const tasks: Promise<any>[] = [];
    otherHandlers.forEach(x => tasks.push(x.assignUris(model, uriRegistry)));

    await Promise.all(tasks);

    return uriRegistry;
  }

  public async convert(model: DataRegistry, uriRegistry: UriRegistry): Promise<N3.Store> {
    return new Promise(async (resolve) => {
      const handlers = container.getAll<IConverterHandler<T>>(EaUmlConverterServiceIdentifier.ConverterHandler);
      const store = new N3.Store();

      const tasks: Promise<any>[] = [];
      handlers.forEach(x => tasks.push(x.convert(model, uriRegistry, store)))

      await Promise.all(tasks);

      resolve(store);
    })
  }
}