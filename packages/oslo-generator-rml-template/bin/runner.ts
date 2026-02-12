#!/usr/bin/env node
import {
  RmlGenerationServiceRunner,
} from '../lib/RmlGenerationServiceRunner';
// eslint-disable-next-line no-sync
new RmlGenerationServiceRunner().runCliSync(process);
