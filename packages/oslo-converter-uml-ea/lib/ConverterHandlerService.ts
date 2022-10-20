import { DataRegistry } from "@oslo-flanders/ea-uml-extractor";
import { container } from "./config/DependencyInjectionConfig";
import { ServiceIdentifier } from "./config/ServiceIdentifier";
import { IConverterHandler } from "./interfaces/IConverterHandler";
import { OsloUriRegistry } from "./UriRegistry";
import * as N3 from 'n3';

export class ConverterHandlerService<T> {
  public async normalize(model: DataRegistry): Promise<DataRegistry> {
    container.getAll<IConverterHandler<T>>(ServiceIdentifier.ConverterHandler)
      .forEach(handler => handler.normalize(model))

    return model;
  }

  public async assignUris(model: DataRegistry, uriRegistry: OsloUriRegistry): Promise<OsloUriRegistry> {
    const packageConverterHandler = container.getNamed<IConverterHandler<T>>(ServiceIdentifier.ConverterHandler, 'PackageConverterHandler');
    await packageConverterHandler.assignUris(model, uriRegistry);

    const otherHandlers = container.getAll<IConverterHandler<T>>(ServiceIdentifier.ConverterHandler)
      .filter(x => x.constructor.name !== 'PackageConverterHandler');

    const tasks: Promise<any>[] = [];
    otherHandlers.forEach(x => tasks.push(x.assignUris(model, uriRegistry)));

    await Promise.all(tasks);

    return uriRegistry;
  }

  public async convert(model: DataRegistry, uriRegistry: OsloUriRegistry): Promise<N3.Store> {
    return new Promise(async (resolve) => {
      const handlers = container.getAll<IConverterHandler<T>>(ServiceIdentifier.ConverterHandler);
      const store = new N3.Store();

      const tasks: Promise<any>[] = [];
      handlers.forEach(x => tasks.push(x.convert(model, uriRegistry, store)))

      await Promise.all(tasks);

      resolve(store);
    })
  }
}