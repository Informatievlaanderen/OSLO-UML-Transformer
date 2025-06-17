#!/usr/bin/env node
import { StakeholdersValidationServiceRunner } from '../lib/StakeholdersValidationServiceRunner';
// eslint-disable-next-line no-sync
new StakeholdersValidationServiceRunner().runCliSync(process);
