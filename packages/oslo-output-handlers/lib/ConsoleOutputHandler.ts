import { IConfiguration, IOutputHandler, ServiceIdentifier } from '@oslo-flanders/core';
import { Quad } from '@rdfjs/types';
import { inject, injectable } from 'inversify';
import * as N3 from 'n3';

/**
 * Logs the RDF.Store to the console
 */
@injectable()
export class ConsoleOutputHandler implements IOutputHandler {
  configuration: IConfiguration;

  public constructor(@inject(ServiceIdentifier.Configuration) config: IConfiguration) {
    this.configuration = config;
  }

  public async write(store: N3.Store<Quad>): Promise<void> {
    console.log(store.getQuads(null, null, null, null));
  }
}