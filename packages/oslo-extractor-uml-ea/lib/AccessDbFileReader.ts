import MDBReader from 'mdb-reader';
import { DataRegistry } from './DataRegistry';
import { IFileReader } from './interfaces/IFileReader';
import { fetchFileOrUrl } from '@oslo-flanders/core';
import { default as Reader } from './MdbReaderWrapper';
import { EaTable } from './enums/EaTable';
import alasql from 'alasql';
import {
  addEaTagsToElements,
  addRoleTagsToElements,
  convertNOTEStoNotes,
} from './utils/assignTags';
import { EaConnector } from './types/EaConnector';
import { mapToEaPackages } from './utils/packageUtils';
import { mapToElementConnector } from './utils/elementConnectorUtils';
import { mapToEaAttribute } from './utils/attributeUtils';
import { mapToEaElement } from './utils/elementUtils';
import {
  addConnectorIdsToDiagram,
  addElementIdsToDiagram,
  mapToEaDiagram,
} from './utils/diagramUtils';
import { EaDiagram } from './types/EaDiagram';

export class AccessDbFileReader implements IFileReader<MDBReader> {
  public async initDataRegistry(
    path: string,
    registry: DataRegistry,
  ): Promise<DataRegistry> {
    const buffer = await fetchFileOrUrl(path);
    const reader = new Reader(buffer);

    await this.loadPackages(reader, registry)
      .then(() => this.loadElements(reader, registry))
      .then(() => this.loadAttributes(reader, registry))
      .then(() => this.loadElementConnectors(reader, registry))
      .then(() => this.loadDiagrams(reader, registry));

    return registry;
  }

  public async loadPackages(
    database: MDBReader,
    registry: DataRegistry,
  ): Promise<void> {
    const packages = database.getTable(EaTable.Package).getData();
    const elements = database.getTable(EaTable.Object).getData();

    const query = `
    SELECT package.Package_ID, package.Name, package.Parent_ID, package.ea_guid, element.Object_ID, element.Stereotype, element.Note
    FROM ? package
    LEFT JOIN ? element ON package.ea_guid = element.ea_guid`;

    const data = <any[]>alasql(query, [packages, elements]);
    registry.packages = mapToEaPackages(data);

    // Object tags contains tags for packages and elements.
    // If tags are added in the load function, then warnings are logged because one is not present
    const objectTags = database.getTable(EaTable.ClassAndPackageTag).getData();
    addEaTagsToElements(objectTags, registry.packages, 'Object_ID', 'Value');
  }

  public async loadElementConnectors(
    database: MDBReader,
    registry: DataRegistry,
  ): Promise<void> {
    const connectors = database.getTable(EaTable.Connector).getData();
    const objects = database.getTable(EaTable.Object).getData();

    const query = `
    SELECT connector.Connector_ID, 
      connector.Name, 
      connector.Direction, 
      connector.Notes, 
      connector.Connector_Type, 
      connector.SourceRole, 
      connector.DestRole, 
      connector.Start_Object_ID, 
      connector.End_Object_ID, 
      connector.PDATA1, 
      connector.ea_guid, 
      connector.SourceCard, 
      connector.DestCard
    FROM ? connector
      INNER JOIN ? source ON connector.Start_Object_ID = source.Object_ID
      INNER JOIN ? destination ON connector.End_Object_ID = destination.Object_ID
    WHERE source.Object_Type in ('Class', 'DataType', 'Enumeration')
      AND destination.Object_Type in ('Class', 'DataType', 'Enumeration')`;

    const data = <any[]>alasql(query, [connectors, objects, objects]);
    registry.connectors = mapToElementConnector(data, registry.elements);

    const connectorTags = database.getTable(EaTable.ConnectorTag).getData();
    addEaTagsToElements(
      connectorTags,
      registry.connectors,
      'ElementID',
      'VALUE',
    );

    const roleTags = database.getTable(EaTable.ConnectorRoleTag).getData();
    addRoleTagsToElements(roleTags, registry.connectors);
  }

  public async loadAttributes(
    database: MDBReader,
    registry: DataRegistry,
  ): Promise<void> {
    const attributes = database.getTable(EaTable.Attribute).getData();
    registry.attributes = mapToEaAttribute(attributes, registry.elements);

    const attributeTags = database.getTable(EaTable.AttributeTag).getData();
    convertNOTEStoNotes(attributeTags);
    addEaTagsToElements(
      attributeTags,
      registry.attributes,
      'ElementID',
      'VALUE',
    );
  }

  public async loadElements(
    database: MDBReader,
    registry: DataRegistry,
  ): Promise<void> {
    const objects = database.getTable(EaTable.Object).getData();
    const query = `
    SELECT Object_ID, Object_Type, Name, Note, Package_ID, Stereotype, ea_guid
    FROM ? object
    WHERE Object_Type IN ('Class', 'DataType', 'Enumeration')`;

    const data = <any[]>alasql(query, [objects]);
    registry.elements = mapToEaElement(data, registry.packages);

    // Object tags contains tags for packages and elements.
    // If tags are added in the load function, then warnings are logged because one is not present
    const objectTags = database.getTable(EaTable.ClassAndPackageTag).getData();
    addEaTagsToElements(objectTags, registry.elements, 'Object_ID', 'Value');
  }

  public async loadDiagrams(
    database: MDBReader,
    registry: DataRegistry,
  ): Promise<void> {
    const diagrams = database.getTable(EaTable.Diagram).getData();

    registry.diagrams = mapToEaDiagram(diagrams, registry.packages);

    await Promise.all([
      this.loadDiagramObjects(database, registry.diagrams),
      this.loadDiagramConnectors(
        database,
        registry.diagrams,
        registry.connectors,
      ),
    ]);
  }

  private async loadDiagramObjects(
    mdb: MDBReader,
    diagrams: EaDiagram[],
  ): Promise<void> {
    const diagramObjects = mdb.getTable(EaTable.DiagramObject).getData();
    const objects = mdb.getTable(EaTable.Object).getData();

    const query = `
    SELECT Diagram_ID, Object_ID
    FROM ? diagramObject
    INNER JOIN ? object ON diagramObject.Object_ID = object.Object_ID
    WHERE object.Object_Type IN ('Class', 'DataType', 'Enumeration')`;

    const filteredDiagramObjects = <any[]>(
      alasql(query, [diagramObjects, objects])
    );
    addElementIdsToDiagram(filteredDiagramObjects, diagrams);
  }

  private async loadDiagramConnectors(
    reader: MDBReader,
    diagrams: EaDiagram[],
    elementConnectors: EaConnector[],
  ): Promise<void> {
    const diagramConnectors = reader.getTable(EaTable.DiagramLink).getData();
    addConnectorIdsToDiagram(diagramConnectors, diagrams, elementConnectors);
  }
}
