#!/usr/bin/env node
import { EaUmlConversionServiceRunner } from '../lib/EaUmlConversionServiceRunner';
// eslint-disable-next-line no-sync
new EaUmlConversionServiceRunner().runCliSync(process);