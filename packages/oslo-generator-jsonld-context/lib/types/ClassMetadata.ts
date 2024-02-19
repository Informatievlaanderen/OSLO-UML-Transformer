import type * as RDF from '@rdfjs/types';

export interface ClassMetadata {
    /**
     * The unique identifier of a class
     */
    osloId: RDF.NamedNode;

    /**
     * The assigned URI of a class and not necessarily unique
     */
    assignedURI: RDF.NamedNode;

    /**
     * The label of the class
     */
    label: RDF.Literal;
}