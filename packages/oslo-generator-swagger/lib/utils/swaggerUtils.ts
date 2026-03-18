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

export function buildProbleemDetailsSchema(): SwaggerSchema {
  return {
    title: 'ProbleemDetails',
    type: 'object',
    description:
      'Een weergave van een algemene foutmelding zoals gedefinieerd in RFC 7807.',
    properties: {
      type: {
        type: 'string',
        format: 'uri',
        description:
          'URI referentie die het probleem identificeert. Deze specificatie moedigt aan om, wanneer de referentie wordt verwijderd, een leesbare documentatie te bieden voor het probleemtype. Als dit element niet aanwezig is, wordt aangenomen dat de waarde about:blank is.',
      },
      title: {
        type: 'string',
        description:
          'Een korte, voor mensen leesbare samenvatting van het probleemtype. Het MAG NIET veranderen tussen verschillende voorkomens van de fout, behalve voor doeleinden van lokalisatie.',
      },
      status: {
        type: 'string',
        description:
          'De HTTP-statuscode die is gegenereerd door de oorspronkelijke server voor dit optreden van het probleem.',
      },
      detail: {
        type: 'string',
        description:
          'Een voor mensen leesbare uitleg die specifiek is voor dit optreden van het probleem',
      },
      instance: {
        type: 'string',
        description:
          'Een URI-referentie die het specifieke optreden van het probleem identificeert. Het kan al dan niet meer informatie opleveren als de referentie wordt verwijderd.',
      },
    },
    required: ['detail', 'title'],
  };
}

/* eslint-enable*/
