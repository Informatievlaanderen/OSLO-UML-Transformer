export const ERROR_RESPONSES: { code: string; description: string }[] = [
  { code: '400', description: 'Invalid data supplied.' },
  { code: '401', description: 'Invalid authorization.' },
  { code: '403', description: 'Authentication failed.' },
  { code: '404', description: 'Resource not found.' },
  { code: '412', description: 'Pre-condition failed.' },
  { code: '500', description: 'Unexpected Server Error.' },
  { code: '502', description: 'Bad Gateway.' },
  { code: '503', description: 'Service unavailable.' },
  { code: '504', description: 'Gateway Timeout.' },
];

export const PROBLEEM_DETAILS_SCHEMA_REF = '#/components/schemas/ProbleemDetails';
