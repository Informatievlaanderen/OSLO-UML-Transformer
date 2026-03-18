export interface SwaggerRoot {
  openapi: string;
  info: SwaggerInfo;
  servers: SwaggerServer[];
  paths: Record<string, SwaggerPath>;
  components?: SwaggerComponents;
}

export interface SwaggerInfo {
  title: string;
  description?: string;
  contact?: SwaggerInfoContact;
  license?: SwaggerInfoLicense;
  version: string;
}

export interface SwaggerInfoContact {
  name?: string;
  url?: string;
  email?: string;
}

export interface SwaggerInfoLicense {
  name?: string;
  url?: string;
}

export interface SwaggerServer {
  url: string;
  description?: string;
}

export interface SwaggerComponents {
  schemas: Record<string, SwaggerSchema>;
  links?: Record<string, SwaggerLink>;
}

export interface SwaggerPath {
  get?: SwaggerPathOperation;
  post?: SwaggerPathOperation;
  put?: SwaggerPathOperation;
  delete?: SwaggerPathOperation;
  patch?: SwaggerPathOperation;
}

export interface SwaggerPathOperation {
  tags?: string[];
  summary?: string;
  description?: string;
  operationId?: string;
  parameters?: SwaggerParameter[];
  requestBody?: SwaggerRequestBody;
  responses: Record<string, SwaggerResponse>;
}

export interface SwaggerParameter {
  name: string;
  description?: string;
  in: string;
  required: boolean;
  schema: { type: string };
}

export interface SwaggerRequestBody {
  description?: string;
  content: Record<
    string,
    { schema: SwaggerSchema | SchemaRef; example?: Record<string, string> }
  >;
}

export interface SwaggerResponse {
  description: string;
  content?: Record<string, { schema: SchemaRef }>;
  links?: Record<string, SwaggerLink>;
}

export interface SwaggerSchema {
  title?: string;
  type: string;
  description?: string;
  pattern?: string;
  format?: string;
  minimum?: number;
  maximum?: number;
  minItems?: number;
  maxItems?: number;
  enum?: string[];
  items?: SwaggerSchema | SchemaRef;
  properties?: Record<string, SwaggerSchema | SchemaRef>;
  required?: string[];
}

export interface SchemaRef {
  $ref: string;
}

export interface SwaggerLink {
  operationId: string;
  parameters: Record<string, string>;
  description: string;
}
export interface ResolvedAttribute {
  attributeLabel: string;
  attributeDefinition?: string;
  attributeUsageNote?: string;
  attributeMinCount: string;
  attributeMaxCount: string;
  attributeDatatypeId: string;
  attributeDatatypeLabel: string;
  attributeClassLabel?: string;
  subclasses: string[];
}

export interface JsonLdSchemaProperty {
  type: string;
  format?: string;
  pattern?: string;
  minimum?: number;
  maximum?: number;
}

export interface JsonLdPrimitiveSchema {
  '@value'?: JsonLdSchemaProperty;
  '@id'?: JsonLdSchemaProperty;
  '@type'?: JsonLdSchemaProperty;
  '@language'?: JsonLdSchemaProperty;
}

export interface DiscriminatorSchema {
  oneOf: SchemaRef[];
  discriminator: {
    propertyName: string;
    mapping: Record<string, string>;
  };
}

export type MappedPropertyResult =
  | JsonLdPrimitiveSchema
  | SchemaRef
  | DiscriminatorSchema;
