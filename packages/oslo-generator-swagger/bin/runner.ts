#!/usr/bin/env node
import {
  SwaggerGenerationServiceRunner,
} from '../lib/SwaggerGenerationServiceRunner';
// eslint-disable-next-line no-sync
new SwaggerGenerationServiceRunner().runCliSync(process);
