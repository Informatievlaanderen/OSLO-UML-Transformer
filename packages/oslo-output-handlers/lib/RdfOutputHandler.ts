import { IConfiguration, IOutputHandler, ServiceIdentifier } from "@oslo-flanders/core";
import { Store, Quad } from "@rdfjs/types";
import { inject } from "inversify";
import * as N3 from 'n3';

// TODO: does an output handler need to have configuration?
// because at this moment we do not know which configuration we receive
export class RdfOutputHandler implements IOutputHandler {
  configuration: IConfiguration;

  public constructor(@inject(ServiceIdentifier.Configuration) config: IConfiguration) {
    this.configuration = config;
  }

  public async write(store: N3.Store<Quad>): Promise<void> {
    console.log(`Soon, an rdf file will be generated`);
  }
}