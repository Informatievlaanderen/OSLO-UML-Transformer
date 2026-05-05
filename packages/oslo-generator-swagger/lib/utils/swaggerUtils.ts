/* eslint-disable max-len */
import { OutputFormat } from '@oslo-flanders/core/lib/enums/OutputFormat';
import {
  ERROR_RESPONSES,
  PROBLEEM_DETAILS_SCHEMA_REF,
} from '../constants/Swagger';
import type {
  SwaggerLink,
  SwaggerResponse,
  SwaggerSchema,
  SchemaRef,
  SwaggerInfoContact,
  SwaggerInfoLicense,
} from '../types/Swagger';

function getProbleemdetailsContent(): {
  [OutputFormat.JsonProblem]: { schema: SchemaRef };
} {
  return {
    [OutputFormat.JsonProblem]: {
      schema: { $ref: PROBLEEM_DETAILS_SCHEMA_REF },
    },
  };
}

function getProbleemdetailsLink(label: string): Record<string, SwaggerLink> {
  return {
    'ProbleemDetails.type': {
      operationId: `${label}GET`,
      parameters: { type: '$response.body#/type' },
      description:
        'De waarde van het attribuut `type` kan gebruikt worden om het gerefereerde object van het type `ProblemDetails` op te halen.',
    },
  };
}

export function getContact(
  contactName?: string,
  contactURL?: string,
  contactEmail?: string,
): SwaggerInfoContact | undefined {
  if (!contactName && !contactURL && !contactEmail) return undefined;
  return { name: contactName, url: contactURL, email: contactEmail };
}

export function getLicense(
  licenseName?: string,
  licenseURL?: string,
): SwaggerInfoLicense | undefined {
  if (!licenseName && !licenseURL) return undefined;
  return { name: licenseName, url: licenseURL };
}

export function buildErrorResponses(
  label: string,
): Record<string, SwaggerResponse> {
  const responses: Record<string, SwaggerResponse> = {};
  for (const { code, description } of ERROR_RESPONSES) {
    responses[code] = {
      description,
      content: getProbleemdetailsContent(),
      links: getProbleemdetailsLink(label),
    };
  }
  return responses;
}

export function filterLinksByClass(
  links: Record<string, SwaggerLink>,
  classLabel: string,
): Record<string, SwaggerLink> {
  const prefix = `${classLabel}.`;
  return Object.fromEntries(
    Object.entries(links).filter(([key]) => key.startsWith(prefix)),
  );
}

/* eslint-enable*/
