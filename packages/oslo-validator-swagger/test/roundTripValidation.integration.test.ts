/**
 * @group integration
 *
 * Integration tests for round-trip validation against the MAGDA Persoon spec.
 * These tests require Docker and download the spec + example files from GitHub.
 *
 * Prerequisites:
 *   docker build -t oslo-swagger-validator-java -f packages/oslo-validator-swagger/Dockerfile .
 *
 * Run:
 *   node node_modules/jest/bin/jest.js --group=integration --config jest.config.ts ./packages/oslo-validator-swagger/
 */
import { resolve } from 'path'
import { runValidation } from '../lib/swaggerValidatorService'
import type { ValidationOptions } from '../lib/types/Validator'

const SPEC_URL =
  'https://raw.githubusercontent.com/Informatievlaanderen/OSLOthema-persoon/master/resources/OSLO-Persoon-MAGDA-IM/validation-unittest/src/main/resources/MAGDA-Persoon-REST-Swagger.json'

const ROOT_MODEL = 'be.vlaanderen.validator.model.PersonEnvelope'

const EXAMPLES_DIR = resolve(__dirname, 'examples')

describe('Round-trip validation (MAGDA Persoon)', () => {
  jest.setTimeout(600_000) // 10 minutes for Docker build + validation

  it('should pass with a valid example', async () => {
    const options: ValidationOptions = {
      rootModel: ROOT_MODEL,
      examples: [`${EXAMPLES_DIR}/example-valid.json`],
    }

    const result = await runValidation(SPEC_URL, options)

    expect(result.passed).toBe(true)
    expect(result.javaValidation.passed).toBe(true)
  })

  it('should fail when the required "data" field is missing', async () => {
    const options: ValidationOptions = {
      rootModel: ROOT_MODEL,
      examples: [`${EXAMPLES_DIR}/example-missing-data.json`],
    }

    const result = await runValidation(SPEC_URL, options)

    expect(result.passed).toBe(false)
    expect(result.javaValidation.message).toContain('data')
  })

  it('should fail when "data" has the wrong type (string instead of object)', async () => {
    const options: ValidationOptions = {
      rootModel: ROOT_MODEL,
      examples: [`${EXAMPLES_DIR}/example-wrong-data-type.json`],
    }

    const result = await runValidation(SPEC_URL, options)

    expect(result.passed).toBe(false)
    expect(result.javaValidation.message).toContain('[deserialization]')
  })

  it('should fail when @type is an unknown value ("VerkeerdType")', async () => {
    const options: ValidationOptions = {
      rootModel: ROOT_MODEL,
      examples: [`${EXAMPLES_DIR}/example-wrong-type.json`],
    }

    const result = await runValidation(SPEC_URL, options)

    expect(result.passed).toBe(false)
    expect(result.javaValidation.message).toContain('[deserialization]')
    expect(result.javaValidation.message).toContain('VerkeerdType')
  })

  it('should fail when a date field has an invalid value', async () => {
    const options: ValidationOptions = {
      rootModel: ROOT_MODEL,
      examples: [`${EXAMPLES_DIR}/example-wrong-date.json`],
    }

    const result = await runValidation(SPEC_URL, options)

    expect(result.passed).toBe(false)
    expect(result.javaValidation.message).toContain('creatiedatum')
  })

  it('should fail when an array with minItems:1 is empty', async () => {
    const options: ValidationOptions = {
      rootModel: ROOT_MODEL,
      examples: [`${EXAMPLES_DIR}/example-empty-array.json`],
    }

    const result = await runValidation(SPEC_URL, options)

    expect(result.passed).toBe(false)
    expect(result.javaValidation.message).toContain('achternaam')
  })

  it('should fail when an unknown field is present (gets dropped in round-trip)', async () => {
    const options: ValidationOptions = {
      rootModel: ROOT_MODEL,
      examples: [`${EXAMPLES_DIR}/example-unknown-field.json`],
    }

    const result = await runValidation(SPEC_URL, options)

    expect(result.passed).toBe(false)
    expect(result.javaValidation.message).toContain('onbekendVeld')
  })

  it('should report all failures when multiple broken examples are provided', async () => {
    const options: ValidationOptions = {
      rootModel: ROOT_MODEL,
      examples: [
        `${EXAMPLES_DIR}/example-missing-data.json`,
        `${EXAMPLES_DIR}/example-wrong-type.json`,
        `${EXAMPLES_DIR}/example-empty-array.json`,
      ],
    }

    const result = await runValidation(SPEC_URL, options)

    expect(result.passed).toBe(false)
    // Should contain failures from all three examples
    expect(result.javaValidation.message).toContain('example-missing-data')
    expect(result.javaValidation.message).toContain('example-wrong-type')
    expect(result.javaValidation.message).toContain('example-empty-array')
  })

  it('should pass when mixing valid and broken examples with --root-model but no --examples', async () => {
    // Only rootModel, no examples → should skip round-trip and pass
    const options: ValidationOptions = {
      rootModel: ROOT_MODEL,
    }

    const result = await runValidation(SPEC_URL, options)

    expect(result.passed).toBe(true)
  })

  it('should pass with explicit generator options matching defaults', async () => {
    // Explicitly pass the same defaults that are in pom.xml
    const options: ValidationOptions = {
      rootModel: ROOT_MODEL,
      examples: [`${EXAMPLES_DIR}/example-valid.json`],
      generatorOptions: {
        useSpringBoot3: 'true',
        interfaceOnly: 'true',
        useJakartaEe: 'true',
        openApiNullable: 'true',
        useOneOfInterfaces: 'true',
        containerDefaultToNull: 'true',
      },
    }

    const result = await runValidation(SPEC_URL, options)

    expect(result.passed).toBe(true)
  })
})