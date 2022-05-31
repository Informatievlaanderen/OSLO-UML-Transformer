#!/usr/bin/env node
import { AppRunner } from '../lib/AppRunner';
// eslint-disable-next-line no-sync
new AppRunner().runCliSync(process);
