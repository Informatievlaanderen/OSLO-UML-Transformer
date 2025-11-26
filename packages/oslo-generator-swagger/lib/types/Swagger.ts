export interface SwaggerRoot {
  openapi: string;
  info: SwaggerInfo;
  servers: SwaggerServer[];
  paths: SwaggerPaths;
  components: SwaggerComponents;
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

export type SwaggerPaths = Record<string, SwaggerPathsOperations>;

export interface SwaggerPathsOperations {
  get?: SwaggerPathsOperation;
  post?: SwaggerPathsOperation;
  put?: SwaggerPathsOperation;
  delete?: SwaggerPathsOperation;
  patch?: SwaggerPathsOperation;
}

export interface SwaggerPathsOperation {
  tags?: string[];
  summary?: string;
  description?: string;
  operationId?: string;
  parameters?: SwaggerPathsOperationParameter[];
  requestBody?: SwaggerPathsOperationRequestBody;
  responses?: SwaggerPathsOperationResponses;
}

export interface SwaggerPathsOperationParameter {
  name?: string;
  description?: string;
  in: string;
  required: boolean;
  schema: SwaggerPathsOperationParameterSchema;
}

export interface SwaggerPathsOperationParameterSchema {
  type: string;
}

export interface SwaggerPathsOperationRequestBody {
  description?: string;
  content: SwaggerPathsOperationRequestBodyContent;
}

export type SwaggerPathsOperationRequestBodyContent = Record<
  string,
  SwaggerPathsOperationRequestBodyContentValue
>;

export interface SwaggerPathsOperationRequestBodyContentValue {
  schema: SwaggerPathsOperationRequestBodyContentValueSchema;
  example?: SwaggerPathsOperationRequestBodyContentValueExample;
}

export interface SwaggerPathsOperationRequestBodyContentValueSchema {
  type: string;
}

export type SwaggerPathsOperationRequestBodyContentValueExample = Record<
  string,
  string
>;

export interface SwaggerPathsOperationResponses {}

export interface SwaggerComponents {
  schemas: SwaggerComponentsSchemas;
}

export type SwaggerComponentsSchemas = Record<
  string,
  SwaggerComponentsSchemasValue
>;

export interface SwaggerComponentsSchemasValue {
  type?: string;
  description?: string;
  properties?: SwaggerComponentsValueProperties;
  required?: string[];
}

export type SwaggerComponentsValueProperties = Record<
  string,
  SwaggerComponentsValuePropertiesValue
>;

export interface SwaggerComponentsValuePropertiesValue {
  type: string;
  description?: string;
  enum?: string[];
  items?: SwaggerComponentsValuePropertiesValueItems;
}

export interface SwaggerComponentsValuePropertiesValueItems {
  type: string;
  description?: string;
  properties?: SwaggerComponentsValueProperties;
  required?: string[];
}
