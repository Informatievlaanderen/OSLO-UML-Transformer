#!/usr/bin/env node
import 'module-alias/register';
import {
  JsonldContextGenerationServiceRunner,
} from '@oslo-generator-jsonld-context/JsonldContextGenerationServiceRunner';
// eslint-disable-next-line no-sync
new JsonldContextGenerationServiceRunner().runCliSync(process);
