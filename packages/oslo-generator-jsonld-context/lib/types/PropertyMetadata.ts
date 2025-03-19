import type * as RDF from '@rdfjs/types';

export interface PropertyMetadata {
  /**
   * The unique identifier of a property
   */
  osloId: RDF.NamedNode;

  /**
   * The assigned URI of a property and not necessarily unique
   */
  assignedURI: RDF.NamedNode;

  /**
   * The label of the property
   */
  label: RDF.Literal;

  /**
   * The label of the domain of a property
   */
  domainLabel: RDF.Literal;

  /**
   * The assigned URI of the range of a property
   */
  rangeAssignedUri: RDF.NamedNode;

  /**
   * Indicates whether the property can have a list of values
   */
  addContainer: boolean;

  /**
   * Indicates to add a prefix when creating a regular context
   */
  addPrefix: boolean;
  /**
   * Indicates whether the property is an object property or a datatype property
   */
  isObjectProperty: boolean;
}
