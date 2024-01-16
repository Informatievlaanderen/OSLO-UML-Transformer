#!/usr/bin/env node
import 'module-alias/register';
import { HtmlRespecGenerationServiceRunner } from '../lib/HtmlRespecGenerationServiceRunner';
// eslint-disable-next-line no-sync
new HtmlRespecGenerationServiceRunner().runCliSync(process);
