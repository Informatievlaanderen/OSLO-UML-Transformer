#!/usr/bin/env node
import 'module-alias/register';
import { ShaclTemplateGenerationServiceRunner }
  from '@oslo-generator-shacl-template/ShaclTemplateGenerationServiceRunner';
// eslint-disable-next-line no-sync
new ShaclTemplateGenerationServiceRunner().runCliSync(process);
