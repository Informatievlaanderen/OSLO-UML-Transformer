#!/usr/bin/env node
import { CodelistGenerationServiceRunner } from '../lib/CodelistGenerationServiceRunner';
// eslint-disable-next-line no-sync
new CodelistGenerationServiceRunner().runCliSync(process);
