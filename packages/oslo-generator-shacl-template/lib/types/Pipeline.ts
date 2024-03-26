import { QuadStore } from "@oslo-flanders/core";
import type { NamedOrBlankNode, ShaclHandler } from "./IHandler";
import type * as RDF from '@rdfjs/types';

export class Pipeline {
  private components: ShaclHandler[] = [];

  public addComponent(component: ShaclHandler): void {
    const newLength = this.components.push(component);

    if(newLength > 1) {
      this.components[newLength - 2].setNext(component);
    }
  }

  public loadSubjectIdToShapeIdMaps(
    subjectIdToShapeIdMap: Map<string, NamedOrBlankNode>,
    propertySubjectIdToShapeIdMap: Map<string, NamedOrBlankNode>,
  ): void {
    this.components.forEach((component) => {
      component.classIdToShapeIdMap = subjectIdToShapeIdMap;
      component.propertyIdToShapeIdMap = propertySubjectIdToShapeIdMap;
    })
  }

  public handle(
    subject: RDF.NamedNode,
    store: QuadStore,
    shaclStore: QuadStore,
  ): void {
    this.components[0].handle(subject, store, shaclStore);
  }
}