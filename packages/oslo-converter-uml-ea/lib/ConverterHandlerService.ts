import type { Logger } from '@oslo-flanders/core';
import { QuadStore } from '@oslo-flanders/core';
import type { DataRegistry, EaObject } from '@oslo-flanders/ea-uml-extractor';
import { container } from './config/DependencyInjectionConfig';
import { EaUmlConverterServiceIdentifier } from './config/EaUmlConverterServiceIdentifier';
import type { ConverterHandler } from './interfaces/ConverterHandler';
import { UriRegistry } from './UriRegistry';

export class ConverterHandlerService<T extends EaObject> {
  public readonly logger: Logger;

  public constructor(logger: Logger) {
    this.logger = logger;
  }

  public async filterHiddenObjects(model: DataRegistry): Promise<DataRegistry> {
    container
      .getAll<
        ConverterHandler<T>
      >(EaUmlConverterServiceIdentifier.ConverterHandler)
      .forEach((handler: ConverterHandler<T>) =>
        handler.filterHiddenObjects(model),
      );
    return model;
  }

  public async filterIgnoredObjects(
    model: DataRegistry,
  ): Promise<DataRegistry> {
    container
      .getAll<
        ConverterHandler<T>
      >(EaUmlConverterServiceIdentifier.ConverterHandler)
      .forEach((handler: ConverterHandler<T>) =>
        handler.filterIgnoredObjects(model),
      );

    return model;
  }

  public async normalize(model: DataRegistry): Promise<DataRegistry> {
    const jobs: Promise<DataRegistry>[] = container
      .getAll<
        ConverterHandler<T>
      >(EaUmlConverterServiceIdentifier.ConverterHandler)
      .map((handler: ConverterHandler<T>) => handler.normalize(model));

    await Promise.all(jobs);

    return model;
  }

  public async assignUris(model: DataRegistry): Promise<UriRegistry> {
    const uriRegistry = new UriRegistry();

    const packageConverterHandler = container.getNamed<ConverterHandler<T>>(
      EaUmlConverterServiceIdentifier.ConverterHandler,
      'PackageConverterHandler',
    );
    await packageConverterHandler.assignUris(model, uriRegistry);

    const otherHandlers = container
      .getAll<
        ConverterHandler<T>
      >(EaUmlConverterServiceIdentifier.ConverterHandler)
      .filter((x) => x.constructor.name !== 'PackageConverterHandler');

    const tasks: Promise<UriRegistry>[] = otherHandlers.map(
      (x: ConverterHandler<T>) => x.assignUris(model, uriRegistry),
    );

    await Promise.all(tasks);

    return uriRegistry;
  }

  public async convert(
    model: DataRegistry,
    uriRegistry: UriRegistry,
  ): Promise<QuadStore> {
    return new Promise(async (resolve) => {
      const handlers = container.getAll<ConverterHandler<T>>(
        EaUmlConverterServiceIdentifier.ConverterHandler,
      );
      const store = new QuadStore();

      let tasks: Promise<any>[] = handlers
        .filter(
          (x) =>
            x.constructor.name === 'PackageConverterHandler' ||
            x.constructor.name === 'ElementConverterHandler',
        )
        .map((x: ConverterHandler<T>) => x.convert(model, uriRegistry, store));

      await Promise.all(tasks);

      tasks = handlers
        .filter(
          (x) =>
            x.constructor.name === 'AttributeConverterHandler' ||
            x.constructor.name === 'ConnectorConverterHandler',
        )
        .map((x) => x.convert(model, uriRegistry, store));

      await Promise.all(tasks);

      resolve(store);
    });
  }
}
