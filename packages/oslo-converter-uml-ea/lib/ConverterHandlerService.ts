import type { Logger } from '@oslo-flanders/core';
import type { DataRegistry, EaObject } from '@oslo-flanders/ea-uml-extractor';
import type { Quad } from 'n3';
import { Store } from 'n3';
import { container } from './config/DependencyInjectionConfig';
import { EaUmlConverterServiceIdentifier } from './config/EaUmlConverterServiceIdentifier';
import type { ConverterHandler } from './interfaces/ConverterHandler';
import { UriRegistry } from './UriRegistry';

export class ConverterHandlerService<T extends EaObject> {
  public readonly logger: Logger;

  public constructor(logger: Logger) {
    this.logger = logger;
  }

  public async filterIgnoredObjects(model: DataRegistry): Promise<DataRegistry> {
    container.getAll<ConverterHandler<T>>(EaUmlConverterServiceIdentifier.ConverterHandler)
      .forEach(handler => handler.filterIgnoredObjects(model));

    return model;
  }

  public async normalize(model: DataRegistry): Promise<DataRegistry> {
    container.getAll<ConverterHandler<T>>(EaUmlConverterServiceIdentifier.ConverterHandler)
      .forEach(handler => handler.normalize(model));

    return model;
  }

  public async assignUris(model: DataRegistry): Promise<UriRegistry> {
    const uriRegistry = new UriRegistry();

    const packageConverterHandler = container
      .getNamed<ConverterHandler<T>>(EaUmlConverterServiceIdentifier.ConverterHandler, 'PackageConverterHandler');
    await packageConverterHandler.assignUris(model, uriRegistry);

    const otherHandlers = container.getAll<ConverterHandler<T>>(EaUmlConverterServiceIdentifier.ConverterHandler)
      .filter(x => x.constructor.name !== 'PackageConverterHandler');

    const tasks: Promise<any>[] = [];
    otherHandlers.forEach(x => tasks.push(x.assignUris(model, uriRegistry)));

    await Promise.all(tasks);

    return uriRegistry;
  }

  public async convert(model: DataRegistry, uriRegistry: UriRegistry): Promise<Store<Quad>> {
    return new Promise(async resolve => {
      const handlers = container.getAll<ConverterHandler<T>>(EaUmlConverterServiceIdentifier.ConverterHandler);
      const store = new Store<Quad>();

      const tasks: Promise<any>[] = [];

      handlers
        .filter(x => x.constructor.name === 'PackageConverterHandler' ||
          x.constructor.name === 'ElementConverterHandler')
        .forEach(x => tasks.push(x.convert(model, uriRegistry, store)));

      await Promise.all(tasks);

      handlers
        .filter(x => x.constructor.name === 'AttributeConverterHandler' ||
          x.constructor.name === 'ConnectorConverterHandler')
        .forEach(x => tasks.push(x.convert(model, uriRegistry, store)));

      await Promise.all(tasks);

      resolve(store);
    });
  }
}
