#!/usr/bin/env node
import { HtmlWebcomponentsV2GenerationServiceRunner } from '../lib/HtmlWebcomponentsV2GenerationServiceRunner';
// eslint-disable-next-line no-sync
new HtmlWebcomponentsV2GenerationServiceRunner().runCliSync(process);
