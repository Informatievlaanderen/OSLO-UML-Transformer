#!/usr/bin/env node
import { HtmlGenerationServiceRunner } from '../lib/HtmlGenerationServiceRunner';
// eslint-disable-next-line no-sync
new HtmlGenerationServiceRunner().runCliSync(process);
