export class OsloEaConverterConfiguration {
  public readonly diagramName: string;
  public readonly umlFile: string;
  public readonly specificationType: string;
  public readonly outputFile: string;
  public readonly targetDomain: string;
  public readonly documentId: string;

  public constructor(
    umlFile: string,
    diagramName: string,
    outputFile: string,
    specificationType: string,
    targetDomain: string,
    documentId: string,
  ) {
    this.umlFile = umlFile;
    this.diagramName = diagramName;
    this.outputFile = outputFile;
    this.specificationType = specificationType;
    this.targetDomain = targetDomain;
    this.documentId = documentId;
  }
}
