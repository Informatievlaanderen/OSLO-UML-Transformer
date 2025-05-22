#!/usr/bin/env node
import { JsonldValidationServiceRunner } from '../lib/JsonldValidationServiceRunner';
// eslint-disable-next-line no-sync
new JsonldValidationServiceRunner().runCliSync(process);
