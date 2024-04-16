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
	if (quadA.subject.termType === quadB.subject.termType) {
		return quadA.subject.value.localeCompare(quadB.subject.value);
	}

	return quadA.subject.termType === 'BlankNode' ? 1 : -1;
}
