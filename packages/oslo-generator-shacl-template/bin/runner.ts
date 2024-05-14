#!/usr/bin/env node
import { ShaclTemplateGenerationServiceRunner }
  from '../lib/ShaclTemplateGenerationServiceRunner';
// eslint-disable-next-line no-sync
new ShaclTemplateGenerationServiceRunner().runCliSync(process);
