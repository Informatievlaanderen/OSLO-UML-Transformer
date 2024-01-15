#!/usr/bin/env node
require('module-alias/register');
import { EaUmlConversionServiceRunner } from '../lib/EaUmlConversionServiceRunner';
// eslint-disable-next-line no-sync
new EaUmlConversionServiceRunner().runCliSync(process);
