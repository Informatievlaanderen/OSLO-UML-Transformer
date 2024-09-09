import type { WebuniversumObject } from "./WebuniversumObject";

type WebuniversumRange = Pick<WebuniversumObject, 'id' | 'vocabularyLabel' | 'applicationProfileLabel'> & {
    listedInDocument?: boolean;
};
export interface WebuniversumProperty extends WebuniversumObject {
    domain: string;
    range: WebuniversumRange;
    minCount?: string;
    maxCount?: string;
    codelist?: string;
}