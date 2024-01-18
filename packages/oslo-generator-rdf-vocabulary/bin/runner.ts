#!/usr/bin/env node
import 'module-alias/register';
import {
  RdfVocabularyGenerationServiceRunner,
} from '@oslo-generator-rdf-vocabulary/RdfVocabularyGenerationServiceRunner';
// eslint-disable-next-line no-sync
new RdfVocabularyGenerationServiceRunner().runCliSync(process);
