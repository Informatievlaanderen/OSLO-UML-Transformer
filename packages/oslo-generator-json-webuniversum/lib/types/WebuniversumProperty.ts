import type { WebuniversumObject } from "./WebuniversumObject";

export interface WebuniversumProperty extends WebuniversumObject {
    domain: string;
    range: Pick<WebuniversumObject, 'id' | 'vocabularyLabel' | 'applicationProfileLabel'>
    minCount?: string;
    maxCount?: string;
    codelist?: string;
}