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

export function getConstraints(constraintStrings: string[] | undefined): Constraint[] {
	if (!constraintStrings) {
		return [];
	}

	return constraintStrings.map((constraintString) => {
		switch (constraintString) {
			case "stringsNotEmpty":
				return Constraint.StringsNotEmpty;
			case "uniqueLanguage":
				return Constraint.UniqueLanguage;
			case "nodeKind":
				return Constraint.NodeKind;
			default:
				throw new Error(`Constraint '${constraintString}' is not supported.`);
		}
	});
}