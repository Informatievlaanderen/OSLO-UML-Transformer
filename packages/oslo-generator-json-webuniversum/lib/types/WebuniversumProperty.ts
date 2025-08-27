import type { WebuniversumObject } from './WebuniversumObject';

type WebuniversumRange = Pick<
  WebuniversumObject,
  'id' | 'vocabularyLabel' | 'applicationProfileLabel'
> & {
  listedInDocument?: boolean;
};
export interface WebuniversumProperty extends WebuniversumObject {
  domain: string;
  range: WebuniversumRange;
  minCount?: string;
  maxCount?: string;
  codelist?: string;
  // Allow for unknown extra properties that can come with --allTags
  [key: string]:
    | string
    | WebuniversumRange
    | WebuniversumObject[]
    | Record<string, string>
    | boolean
    | undefined;
}
