import { DataRegistry, EaAttribute } from "@oslo-flanders/ea-uml-extractor";
import { Store, Quad } from "@rdfjs/types";
import { injectable } from "inversify";
import { IConverterHandler } from "../interfaces/IConverterHandler";
import { UriRegistry } from "../UriRegistry";

@injectable()
export class AttributeConverterHandler implements IConverterHandler<EaAttribute> {
  public async convert(normalizedModel: DataRegistry, uriRegistry: UriRegistry, store: Store<Quad>): Promise<Store<Quad>> {
    // TODO
    return store;
  }

  public async normalize(model: DataRegistry): Promise<DataRegistry> {
    // TODO
    return model;
  }

  public async assignUris(normalizedModel: DataRegistry, uriRegistry: UriRegistry): Promise<UriRegistry> {
    // TODO
    return uriRegistry;
  }

  public createQuads(object: EaAttribute): Quad[] {
    // TODO
    return [];
  }
}