#!/usr/bin/env node
import { EaUmlConversionServiceRunner } from '@oslo-converter-uml-ea/EaUmlConversionServiceRunner';
// eslint-disable-next-line no-sync
new EaUmlConversionServiceRunner().runCliSync(process);
