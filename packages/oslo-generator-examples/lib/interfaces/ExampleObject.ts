import type { ExampleProperty } from './ExampleProperty';

export interface ExampleObject {
  '@context': string;
  '@type': string;
  '@id': string;
  [key: string]: ExampleProperty | string;
}
