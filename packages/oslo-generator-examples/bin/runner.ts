#!/usr/bin/env node
import { ExamplesGenerationServiceRunner } from '../lib/ExamplesGenerationServiceRunner';
// eslint-disable-next-line no-sync
new ExamplesGenerationServiceRunner().runCliSync(process);
