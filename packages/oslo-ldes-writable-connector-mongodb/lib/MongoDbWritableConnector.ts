import type { LdesWritableConnector, OsloLdesMember } from '@oslo-flanders/core';
import { MongoClient } from 'mongodb';

interface MongoDbWritableConnectorConfig {
  url: string;
}

export class MongoDbWritableConnector implements LdesWritableConnector<MongoDbWritableConnectorConfig> {
  private _client: MongoClient | undefined;

  public async writeVersion(member: Partial<OsloLdesMember>): Promise<void> {
    // 1. Query by versionId
    // 2. Add object if not already in it
  }

  public async init(config: MongoDbWritableConnectorConfig): Promise<void> {
    this.client = new MongoClient(config.url);
    await this.client.connect();
  }

  public async stop(): Promise<void> {
    await this.client.close();
  }

  public get client(): MongoClient {
    if (!this._client) {
      throw new Error(`MongoClient was not set yet.`);
    }
    return this._client;
  }

  public set client(value: MongoClient) {
    this._client = value;
  }
}
