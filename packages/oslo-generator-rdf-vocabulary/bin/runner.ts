#!/usr/bin/env node
import {
  RdfVocabularyGenerationServiceRunner,
} from '@oslo-generator-rdf-vocabulary/RdfVocabularyGenerationServiceRunner';
// eslint-disable-next-line no-sync
new RdfVocabularyGenerationServiceRunner().runCliSync(process);
