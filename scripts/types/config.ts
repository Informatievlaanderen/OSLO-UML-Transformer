export interface IPublication {
  [key: string]: string | object | boolean | number;
  urlref: string;
  repository: string;
  branchtag: string;
  name: string;
  filename: string;
}

export interface IConfig {
  name: string;
  type: 'ap' | 'voc';
  eap: string;
  diagram: string;
  template: string;
  title: string;
  'publication-state': string;
  'publication-date': string;
  license: string;
  'contributors-file': string;
  'contributors-column': string;
  feedbackurl: string;
  standaardregisterurl: string;
  repository?: string;
}

export interface IEapConfig {
  umlFile: string;
  diagramName: string;
  specificationType: string;
  versionId: string;
  publicationEnvironment: string;
}
