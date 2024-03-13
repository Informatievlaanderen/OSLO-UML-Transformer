#!/usr/bin/env node
import 'module-alias/register';
import {
    JsonWebuniversumGenerationServiceRunner,
} from '@oslo-generator-json-webuniversum/JsonWebuniversumGenerationServiceRunner';
// eslint-disable-next-line no-sync
new JsonWebuniversumGenerationServiceRunner().runCliSync(process);