import type * as RDF from '@rdfjs/types';
import { Constraint } from "../enums/Constraint";
import { GenerationMode } from "../enums/GenerationMode";

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
