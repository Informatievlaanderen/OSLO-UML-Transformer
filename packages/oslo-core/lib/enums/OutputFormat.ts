export enum OutputFormat {
  JsonLd = 'application/ld+json',
  JsonProblem = 'application/problem+json',
  Json = 'application/json',
  Yaml = 'application/yaml',
  trig = 'application/trig',
  turtle = 'text/turtle',
  nquads = 'application/n-quads',
  ntriples = 'application/n-triples',
  unsupported = 'unsupported/format',
}

export const FILE_EXTENSIONS: Record<string, string> = {
  [OutputFormat.Json]: '.json',
  [OutputFormat.Yaml]: '.yaml',
};
