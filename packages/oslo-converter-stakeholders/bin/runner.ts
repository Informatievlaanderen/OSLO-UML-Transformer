#!/usr/bin/env node
import { StakeholdersConversionServiceRunner } from '../lib/StakeholdersConversionServiceRunner';
// eslint-disable-next-line no-sync
new StakeholdersConversionServiceRunner().runCliSync(process);
