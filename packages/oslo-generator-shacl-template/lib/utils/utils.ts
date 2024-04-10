import type * as RDF from '@rdfjs/types';
import { Constraint } from "@oslo-generator-shacl-template/enums/Constraint";
import { GenerationMode } from "@oslo-generator-shacl-template/enums/GenerationMode";

export function getGenerationMode(mode: string): GenerationMode {
	switch (mode) {
		case "grouped":
			return GenerationMode.Grouped;
		case "individual":
			return GenerationMode.Individual;
		default:
			throw new Error(`Generation mode '${mode}' is not supported.`);
	}
}

export function getConstraints(constraintStrings: string[]): Constraint[] {
	return constraintStrings.map((constraintString) => {
		switch (constraintString) {
			case "stringsNotEmpty":
				return Constraint.StringsNotEmpty;
			case "uniqueLanguages":
				return Constraint.UniqueLanguage;
			case "nodeKind":
				return Constraint.NodeKind;
			case "codelist":
				return Constraint.Codelist;
			default:
				throw new Error(`Constraint '${constraintString}' is not supported.`);
		}
	});
}

export const toPascalCase = (str: string): string => str
	.split(' ')
	.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
	.join('')

/**
 * Sort function used on an array of quads. First sorts named nodes alphabetically, then blank nodes alphabetically.
 * @param quadA An RDF.Quad
 * @param quadB An RDF.Quad
 * @returns a number
 */
export const quadSort = (quadA: RDF.Quad, quadB: RDF.Quad): number => {
	// Check if the subjects are named nodes or blank nodes
	const aIsBlankNode = quadA.subject.termType === 'BlankNode';
	const bIsBlankNode = quadB.subject.termType === 'BlankNode';

	// If both subjects are the same type, compare their values
	if (aIsBlankNode === bIsBlankNode) {
		return quadA.subject.value.localeCompare(quadB.subject.value);
	}

	// If one subject is a named node and the other is a blank node, the named node should come first
	return aIsBlankNode ? 1 : -1;
}