#!/usr/bin/env node
// Validates a spec config file (the shape of .names.json / config/<name>-*.json)
// before it is handed to the legacy update-config-translation.js helper.
//
// The JSON Schema (pipeline/schemas/spec-config.schema.json) checks the overall
// shape, including the required top-level `template` that the upgrade step
// needs to derive goal-language translation blocks. This script additionally
// checks that the main-language block (when present) carries the fields the
// legacy helper passes through `updateValue` (which crashes on undefined).
//
// Usage:
//   node validate-config-schema.js -i <config.json> -m <mainLanguage> [-s <schema.json>]
//
// Exit codes:
//   0  config is valid
//   1  config failed validation (details printed to stderr)

const fs = require('node:fs')
const path = require('node:path')
const Ajv = require('ajv')

const args = process.argv.slice(2)
function argValue (flag) {
  const idx = args.indexOf(flag)
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : null
}

const inputFile = argValue('-i') || argValue('--input')
const mainLanguage = argValue('-m') || argValue('--mainLanguage')
const schemaFile = argValue('-s') || argValue('--schema')

if (!inputFile) {
  console.error('ERROR: missing required option -i/--input <path>')
  process.exit(1)
}

const DEFAULT_SCHEMA = path.join(__dirname, '..', 'schemas', 'spec-config.schema.json')
const schemaPath = schemaFile || DEFAULT_SCHEMA

function fail (message) {
  console.error(message)
  process.exit(1)
}

// --- load schema ------------------------------------------------------------
let schema
try {
  schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'))
} catch (err) {
  fail(`ERROR: cannot read schema ${schemaPath}: ${err.message}`)
}

// --- load config ------------------------------------------------------------
let config
try {
  config = JSON.parse(fs.readFileSync(inputFile, 'utf-8'))
} catch (err) {
  fail(`ERROR: cannot read config ${inputFile}: ${err.message}`)
}

// --- 1. static schema validation --------------------------------------------
const ajv = new Ajv({ allErrors: true })
const validate = ajv.compile(schema)
if (!validate(config)) {
  const details = validate.errors
    .map((e) => `  - ${e.instancePath || e.dataPath || '/'} ${e.message}`)
    .join('\n')
  fail(`ERROR: config ${inputFile} does not conform to ${schemaPath}:\n${details}`)
}

// --- 2. main-language completeness ------------------------------------------
// Mirrors the assumptions of update-config-translation.js: the main-language
// block (if present) is the source for deriving goal-language blocks.
if (mainLanguage) {
  // An empty array means the publication point name did not match any entry in
  // the config — the caller (upgrade_config-4.sh) already reports this clearly.
  if (Array.isArray(config) && config.length === 0) {
    process.exit(0)
  }
  const spec = Array.isArray(config) ? config[0] : config
  const translations = spec.translation || []
  const mainBlock = translations.find((t) => t.language === mainLanguage)

  if (mainBlock) {
    // The crash-fields are template/translationjson/mergefile (all passed
    // through updateValue which crashes on undefined). title is sent to the
    // Azure translator and may legitimately be empty after a failed call.
    const missing = ['template', 'translationjson', 'mergefile'].filter(
      (field) => !mainBlock[field] || mainBlock[field] === ''
    )
    if (missing.length > 0) {
      fail(
        `ERROR: config ${inputFile} has a translation block for main language '${mainLanguage}' ` +
        `but it is missing: ${missing.join(', ')}. ` +
        `The upgrade step needs these fields to derive the goal-language blocks.`
      )
    }
  }
}

console.log(`OK: config ${inputFile} is valid`)
