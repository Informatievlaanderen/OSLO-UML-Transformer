export interface SwaggerRoot {
  openapi: string;
  info: SwaggerInfo;
  servers: SwaggerServer[];
  paths: Record<string, OpenApiPath>;
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
  schemas: Record<string, OpenApiSchema>;
  links?: Record<string, OpenApiLink>;
}

export interface OpenApiPath {
  get?: OpenApiPathOperation;
  post?: OpenApiPathOperation;
  put?: OpenApiPathOperation;
  delete?: OpenApiPathOperation;
  patch?: OpenApiPathOperation;
}

export interface OpenApiPathOperation {
  tags?: string[];
  summary?: string;
  description?: string;
  operationId?: string;
  parameters?: OpenApiParameter[];
  requestBody?: OpenApiRequestBody;
  responses: Record<string, OpenApiResponse>;
}

export interface OpenApiParameter {
  name: string;
  description?: string;
  in: string;
  required: boolean;
  schema: { type: string };
}

export interface OpenApiRequestBody {
  description?: string;
  content: Record<
    string,
    { schema: OpenApiSchema | SchemaRef; example?: Record<string, string> }
  >;
}

export interface OpenApiResponse {
  description: string;
  content?: Record<string, { schema: SchemaRef }>;
  links?: Record<string, OpenApiLink>;
}

export interface OpenApiSchema {
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
  items?: OpenApiSchema | SchemaRef;
  properties?: Record<string, OpenApiSchema | SchemaRef>;
  required?: string[];
}

export interface SchemaRef {
  $ref: string;
}

export interface OpenApiLink {
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
