import type { WebuniversumProperty } from "./WebuniversumProperty";

export interface WebuniversumObject {
    id: string;
    vocabularyLabel?: Record<string, string>;
    applicationProfileLabel?: Record<string, string>;
    vocabularyDefinition?: Record<string, string>;
    applicationProfileDefinition?: Record<string, string>;
    vocabularyUsageNote?: Record<string, string>;
    applicationProfileUsageNote?: Record<string, string>;
    parents?: Pick<WebuniversumObject, 'id' | 'vocabularyLabel' | 'applicationProfileLabel'>[];

    // TODO: this should be made mandatory in the future
    scope?: string;
    properties?: WebuniversumProperty[];
}