#!/usr/bin/env node
import {
  MarkdownGenerationServiceRunner,
} from '../lib/MarkdownGenerationServiceRunner';
// eslint-disable-next-line no-sync
new MarkdownGenerationServiceRunner().runCliSync(process);
