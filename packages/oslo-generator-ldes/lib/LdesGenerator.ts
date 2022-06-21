import type { GeneratorConfiguration } from '@oslo-flanders/configuration';
import type { LdesWritableConnector, OsloLdesMember } from '@oslo-flanders/core';
import { ns, Generator } from '@oslo-flanders/core';
import { SHA256 } from 'crypto-js';
import { DataFactory } from 'rdf-data-factory';

export class LdesGenerator<T> extends Generator<GeneratorConfiguration> {
  private readonly factory: DataFactory;
  private _connector: LdesWritableConnector<T> | undefined;

  public constructor() {
    super();
    this.factory = new DataFactory();
  }

  public async generate(data: string): Promise<void> {
    const store = await this.createRdfStore(data, this.configuration.language);
    const documentUrl = `${this.configuration.baseUri}${this.configuration.documentId}`;

    const tasks: Promise<void>[] = [];

    const objectIds = store.getObjects(this.factory.namedNode(documentUrl), null, null);
    objectIds.forEach(objectId => {
      const quads = store.getQuads(objectId, null, null, null);

      const type = quads.find(x => x.predicate.equals(ns.rdf('type')))?.object.value;
      const label = quads.find(x => x.predicate.equals(ns.rdfs('label')))?.object.value;
      const definition = quads.find(x => x.predicate.equals(ns.rdfs('comment')))?.object.value;
      const scope = quads.find(x => x.predicate.equals(ns.example('scope')))?.object.value;
      const guid = quads.find(x => x.predicate.equals(ns.example('guid')))!.object.value;

      const versionId = SHA256(JSON.stringify({ guid, documentId: this.configuration.documentId })).toString();

      const member: Partial<OsloLdesMember> = {
        versionId,
        entityId: objectId.value,
        label,
        type,
        definition,
        scope,
        context: documentUrl,
      };

      tasks.push(this.connector.writeVersion(member));
    });

    await Promise.all(tasks);
  }

  public async init(config: GeneratorConfiguration): Promise<void> {
    await super.init(config);

    if (!config.ldesBackendConnectorPackageName) {
      throw new Error(`LdesWritableConnector is not configured. Please set value for 'ldesBackendConnectorPackageName' in configuration.`);
    }

    const WritableConnectorPackage = require(config.ldesBackendConnectorPackageName);
    const connectorName = Object.keys(WritableConnectorPackage).find(key => key.endsWith('Connector'));

    if (!connectorName) {
      throw new Error(`WritableConnector ${config.ldesBackendConnectorPackageName} could not be loaded correctly!`);
    }

    this.connector = new WritableConnectorPackage[connectorName]();
    await this.connector.init();
  }

  public get connector(): LdesWritableConnector {
    if (!this._connector) {
      throw new Error(`LdesWritableConnector is not set yet.`);
    }

    return this._connector;
  }

  public set connector(value: LdesWritableConnector) {
    this._connector = value;
  }
}
