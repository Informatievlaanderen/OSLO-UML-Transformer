#!/usr/bin/env node
import { StakeholdersValidationServiceRunner } from '../lib/StakeholdersValidationServiceRunner.js';
// eslint-disable-next-line no-sync
new StakeholdersValidationServiceRunner().runCliSync(process);
