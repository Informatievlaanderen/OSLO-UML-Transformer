// TODO: once we shift to componentsjs,
// this must be converted to a class
export interface ConverterConfiguration {
  readonly converterPackageName: string;
  readonly diagramName: string;
  readonly umlFile: string;
  readonly specificationType: string;
  readonly outputFile: string;
  readonly targetDomain: string;
  readonly documentId: string;
}
