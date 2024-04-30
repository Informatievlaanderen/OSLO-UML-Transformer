#!/usr/bin/env node
import {
    JsonWebuniversumGenerationServiceRunner,
} from '../lib/JsonWebuniversumGenerationServiceRunner';
// eslint-disable-next-line no-sync
new JsonWebuniversumGenerationServiceRunner().runCliSync(process);