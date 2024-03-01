import type { WebuniversumObject } from "@oslo-generator-json-webuniversum/types/WebuniversumObject";

export function sortWebuniversumObjects(
    webuniversumObjects: WebuniversumObject[],
    language: string,
): WebuniversumObject[] {
    return webuniversumObjects.sort((classA: WebuniversumObject, classB: WebuniversumObject) =>
        (classA.vocabularyLabel?.[language] || "")
            .localeCompare(classB.vocabularyLabel?.[language] || ""));
}