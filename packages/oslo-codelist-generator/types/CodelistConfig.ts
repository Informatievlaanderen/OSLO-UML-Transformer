export interface CodelistConfig {
  input: string;
  output: string;
  language?: string;
  labelColumn?: string;
  definitionColumn?: string;
  datasetColumn?: string;
  statusColumn?: string;
  broaderColumn?: string;
  narrowerColumn?: string;
  notationColumn?: string;
}
