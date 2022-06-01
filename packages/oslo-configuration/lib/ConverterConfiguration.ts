// TODO: once we shift to componentsjs,
// this must be converted to a class
export interface ConverterConfiguration {
  readonly diagramName: string;
  readonly umlFile: string;
  readonly specificationType: string;
  readonly outputFile: string;
  readonly publicationEnvironmentDomain: string;
  readonly documentId: string;
}
