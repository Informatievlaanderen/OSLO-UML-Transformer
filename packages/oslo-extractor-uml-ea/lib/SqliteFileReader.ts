import { fetchFileOrUrl } from '@oslo-flanders/core';
import { DataRegistry } from './DataRegistry';
import type { IFileReader } from './interfaces/IFileReader';
import type { Database as SqliteDatabase } from 'better-sqlite3';
import Database from 'better-sqlite3';
import { EaTable } from './enums/EaTable';
import { mapToEaPackages } from './utils/packageUtils';
import {
  addEaTagsToElements,
  addRoleTagsToElements,
  convertNOTEStoNotes,
} from './utils/assignTags';
import { mapToEaElement } from './utils/elementUtils';
import { mapToEaAttribute } from './utils/attributeUtils';
import { mapToElementConnector } from './utils/elementConnectorUtils';
import {
  addConnectorIdsToDiagram,
  addElementIdsToDiagram,
  mapToEaDiagram,
} from './utils/diagramUtils';
import { EaDiagram } from './types/EaDiagram';
import { EaConnector } from './types/EaConnector';

export class SqliteFileReader implements IFileReader<SqliteDatabase> {
  public async initDataRegistry(
    path: string,
    registry: DataRegistry,
  ): Promise<DataRegistry> {
    const buffer = await fetchFileOrUrl(path);
    const db = new Database(buffer, { verbose: console.log });

    await this.loadPackages(db, registry)
      .then(() => this.loadElements(db, registry))
      .then(() => this.loadAttributes(db, registry))
      .then(() => this.loadElementConnectors(db, registry))
      .then(() => this.loadDiagrams(db, registry));

    return registry;
  }

  public async loadPackages(
    database: SqliteDatabase,
    registry: DataRegistry,
  ): Promise<void> {
    const packageStatement = database.prepare(`
      SELECT package.Package_ID, package.Name, package.Parent_ID, package.ea_guid, element.Object_ID, element.Stereotype, element.Note 
      FROM ${EaTable.Package} AS package
      LEFT JOIN ${EaTable.Object} AS element on package.ea_guid = element.ea_guid
    `);

    registry.packages = mapToEaPackages(packageStatement.all());

    // Object tags contains tags for packages and elements.
    // If tags are added in the load function, then warnings are logged because one is not present
    const objectTags = database
      .prepare(`SELECT * FROM ${EaTable.ClassAndPackageTag}`)
      .all();
    addEaTagsToElements(objectTags, registry.packages, 'Object_ID', 'Value');
  }

  public async loadElements(
    database: SqliteDatabase,
    registry: DataRegistry,
  ): Promise<void> {
    const elementStatement = database.prepare(`
      SELECT Object_ID, Object_Type, Name, Note, Package_ID, Stereotype, ea_guid
      FROM ${EaTable.Object}
      WHERE Object_Type IN ('Class', 'DataType', 'Enumeration')
    `);

    registry.elements = mapToEaElement(
      elementStatement.all(),
      registry.packages,
    );

    // Object tags contains tags for packages and elements.
    // If tags are added in the load function, then warnings are logged because one is not present
    const objectTags = database
      .prepare(`SELECT * FROM ${EaTable.ClassAndPackageTag}`)
      .all();
    addEaTagsToElements(objectTags, registry.elements, 'Object_ID', 'Value');
  }

  public async loadAttributes(
    database: SqliteDatabase,
    registry: DataRegistry,
  ): Promise<void> {
    const attributeStatement = database.prepare(`
      SELECT * FROM ${EaTable.Attribute}
    `);

    const data = attributeStatement.all();
    registry.attributes = mapToEaAttribute(data, registry.elements);

    const attributeTags = database
      .prepare(`SELECT * FROM ${EaTable.AttributeTag}`)
      .all();
    convertNOTEStoNotes(attributeTags);
    addEaTagsToElements(
      attributeTags,
      registry.attributes,
      'ElementID',
      'VALUE',
    );
  }

  public async loadElementConnectors(
    database: SqliteDatabase,
    registry: DataRegistry,
  ): Promise<void> {
    const elementConnectorStatement = database.prepare(`
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
      FROM ${EaTable.Connector} AS connector 
      INNER JOIN ${EaTable.Object} AS source ON connector.Start_Object_ID = source.Object_ID
      INNER JOIN ${EaTable.Object} AS destination ON connector.End_Object_ID = destination.Object_ID
      WHERE source.Object_Type in ('Class', 'DataType', 'Enumeration')
      AND destination.Object_Type in ('Class', 'DataType', 'Enumeration')`);

    registry.connectors = mapToElementConnector(
      elementConnectorStatement.all(),
      registry.elements,
    );

    const connectorTags = database
      .prepare(`SELECT * FROM ${EaTable.ConnectorTag}`)
      .all();
    addEaTagsToElements(
      connectorTags,
      registry.connectors,
      'ElementID',
      'VALUE',
    );

    const roleTags = database
      .prepare(`SELECT * FROM ${EaTable.ConnectorRoleTag}`)
      .all();
    addRoleTagsToElements(roleTags, registry.connectors);
  }

  public async loadDiagrams(
    database: SqliteDatabase,
    registry: DataRegistry,
  ): Promise<void> {
    const diagramStatement = database.prepare(`
      SELECT * FROM ${EaTable.Diagram}
    `);

    registry.diagrams = mapToEaDiagram(
      diagramStatement.all(),
      registry.packages,
    );

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
    database: SqliteDatabase,
    diagrams: EaDiagram[],
  ): Promise<void> {
    const diagramObjectStatement = database.prepare(`
      SELECT diagramObject.Diagram_ID, diagramObject.Object_ID
      FROM ${EaTable.DiagramObject} AS diagramObject
      INNER JOIN ${EaTable.Object} AS object ON diagramObject.Object_ID = object.Object_ID
      WHERE object.Object_Type IN ('Class', 'DataType', 'Enumeration')`);

    addElementIdsToDiagram(diagramObjectStatement.all(), diagrams);
  }

  private async loadDiagramConnectors(
    database: SqliteDatabase,
    diagrams: EaDiagram[],
    elementConnectors: EaConnector[],
  ): Promise<void> {
    const diagramConnectorStatement = database.prepare(
      `SELECT * FROM ${EaTable.DiagramLink}`,
    );
    addConnectorIdsToDiagram(
      diagramConnectorStatement.all(),
      diagrams,
      elementConnectors,
    );
  }
}
