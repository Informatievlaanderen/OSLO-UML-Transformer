#!/usr/bin/env node
import { HtmlRespecGenerationServiceRunner } from '@oslo-generator-respec-html/HtmlRespecGenerationServiceRunner';
// eslint-disable-next-line no-sync
new HtmlRespecGenerationServiceRunner().runCliSync(process);
