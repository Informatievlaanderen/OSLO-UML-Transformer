#!/usr/bin/env node
import { JsonldContextGenerationServiceRunner } from '../lib/JsonldContextGenerationServiceRunner';
// eslint-disable-next-line no-sync
new JsonldContextGenerationServiceRunner().runCliSync(process);
