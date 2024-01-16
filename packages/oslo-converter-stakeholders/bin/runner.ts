#!/usr/bin/env node
import 'module-alias/register';
import { StakeholdersConversionServiceRunner } from '../lib/StakeholdersConversionServiceRunner';
// eslint-disable-next-line no-sync
new StakeholdersConversionServiceRunner().runCliSync(process);
