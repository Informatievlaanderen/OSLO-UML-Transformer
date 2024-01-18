#!/usr/bin/env node
import 'module-alias/register';
import { StakeholdersConversionServiceRunner } from '@oslo-converter-stakeholders/StakeholdersConversionServiceRunner';
// eslint-disable-next-line no-sync
new StakeholdersConversionServiceRunner().runCliSync(process);
