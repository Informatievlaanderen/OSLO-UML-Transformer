export interface GeneratorConfiguration {
  contextOutput: string;
  shaclOutput: string;
  language: string;
  addDomainPrefix: boolean;
  targetLanguage: string;
  translationFileOutput: string;
  documentId: string;
  baseUri: string;
  ldesBackendConnectorPackageName: string;
  databaseUrl: string;
}
