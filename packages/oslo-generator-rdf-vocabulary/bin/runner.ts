#!/usr/bin/env node
import 'module-alias/register';
import { RdfVocabularyGenerationServiceRunner } from '../lib/RdfVocabularyGenerationServiceRunner';
// eslint-disable-next-line no-sync
new RdfVocabularyGenerationServiceRunner().runCliSync(process);
