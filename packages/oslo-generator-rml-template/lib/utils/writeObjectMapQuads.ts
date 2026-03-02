import type { Logger, QuadStore } from '@oslo-flanders/core';
import { ns } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';
import type { DataFactory } from 'rdf-data-factory';
import type { RmlPredicateObjectMap } from '../types/Rml';

export function writeObjectMapQuads(
  objectMapId: RDF.BlankNode,
  pom: RmlPredicateObjectMap,
  label: string,
  rmlStore: QuadStore,
  df: DataFactory,
  logger: Logger,
): void {
  if (pom.parentTriplesMap && pom.referenceType) {
    writeIriObjectMap(objectMapId, pom, rmlStore, df);
  } else if (pom.parentTriplesMap) {
    writeJoinObjectMap(objectMapId, pom, rmlStore, df);
  } else if (pom.datatype === ns.xsd('anyURI').value) {
    writeIriObjectMap(objectMapId, pom, rmlStore, df);
  } else if (pom.language) {
    writeLangStringObjectMap(objectMapId, pom, rmlStore, df);
  } else if (pom.datatype) {
    writeDatatypeObjectMap(objectMapId, pom, rmlStore, df);
  } else {
    logger.error(`Cannot generate Object Map for ${label}`);
  }
}

function writeIriObjectMap(
  objectMapId: RDF.BlankNode,
  pom: RmlPredicateObjectMap,
  rmlStore: QuadStore,
  df: DataFactory,
): void {
  rmlStore.addQuads([
    df.quad(
      objectMapId,
      ns.rml(pom.referenceType ?? 'template'),
      df.literal(pom.object),
    ),
    df.quad(objectMapId, ns.rml('termType'), ns.rml('IRI')),
    df.quad(objectMapId, ns.rdf('type'), ns.rml('ObjectMap')),
  ]);
}

function writeJoinObjectMap(
  objectMapId: RDF.BlankNode,
  pom: RmlPredicateObjectMap,
  rmlStore: QuadStore,
  df: DataFactory,
): void {
  const joinConditionId = df.blankNode();
  rmlStore.addQuads([
    df.quad(
      objectMapId,
      ns.rml('parentTriplesMap'),
      df.namedNode(pom.parentTriplesMap),
    ),
    df.quad(objectMapId, ns.rml('joinCondition'), joinConditionId),
    df.quad(joinConditionId, ns.rml('child'), df.literal(pom.child)),
    df.quad(joinConditionId, ns.rml('parent'), df.literal(pom.parent)),
    df.quad(objectMapId, ns.rdf('type'), ns.rml('RefObjectMap')),
  ]);
}

function writeLangStringObjectMap(
  objectMapId: RDF.BlankNode,
  pom: RmlPredicateObjectMap,
  rmlStore: QuadStore,
  df: DataFactory,
): void {
  rmlStore.addQuads([
    df.quad(
      objectMapId,
      ns.rml(pom.referenceType ?? 'reference'),
      df.literal(pom.object),
    ),
    df.quad(objectMapId, ns.rml('language'), df.literal(pom.language)),
    df.quad(objectMapId, ns.rml('termType'), ns.rml('Literal')),
    df.quad(objectMapId, ns.rdf('type'), ns.rml('ObjectMap')),
  ]);
}

function writeDatatypeObjectMap(
  objectMapId: RDF.BlankNode,
  pom: RmlPredicateObjectMap,
  rmlStore: QuadStore,
  df: DataFactory,
): void {
  rmlStore.addQuads([
    df.quad(
      objectMapId,
      ns.rml(pom.referenceType ?? 'reference'),
      df.literal(pom.object),
    ),
    df.quad(objectMapId, ns.rml('datatype'), df.namedNode(pom.datatype)),
    df.quad(objectMapId, ns.rml('termType'), ns.rml('Literal')),
    df.quad(objectMapId, ns.rdf('type'), ns.rml('ObjectMap')),
  ]);
}
