#!/usr/bin/env node
import {
  SparqlGenerationServiceRunner,
} from '../lib/SparqlGenerationServiceRunner';
// eslint-disable-next-line no-sync
new SparqlGenerationServiceRunner().runCliSync(process);
