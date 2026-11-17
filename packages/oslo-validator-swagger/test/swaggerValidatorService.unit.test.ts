/**
 * @group unit
 */
import { runValidation } from '../lib/swaggerValidatorService'
import { runJavaValidation } from '../lib/javaRunner'
import type { ValidationOptions } from '../lib/types/Validator'

// Mock the javaRunner module
jest.mock('../lib/javaRunner', () => ({
  runJavaValidation: jest.fn(),
}))

describe('runValidation', () => {
  const mockRunJavaValidation = runJavaValidation as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return a passing result when Java validation passes', async () => {
    mockRunJavaValidation.mockResolvedValue({ passed: true })

    const result = await runValidation('spec.json')

    expect(result.passed).toBe(true)
    expect(result.javaValidation.passed).toBe(true)
    expect(mockRunJavaValidation).toHaveBeenCalledWith('spec.json', undefined)
  })

  it('should return a failing result when Java validation fails', async () => {
    mockRunJavaValidation.mockResolvedValue({
      passed: false,
      message: 'Validation error',
    })

    const result = await runValidation('spec.json')

    expect(result.passed).toBe(false)
    expect(result.javaValidation.passed).toBe(false)
    expect(result.javaValidation.message).toBe('Validation error')
  })

  it('should forward options to runJavaValidation', async () => {
    mockRunJavaValidation.mockResolvedValue({ passed: true })

    const options: ValidationOptions = {
      rootModel: 'be.vlaanderen.validator.model.Person',
      examples: ['example.json'],
    }

    await runValidation('spec.json', options)

    expect(mockRunJavaValidation).toHaveBeenCalledWith('spec.json', options)
  })

  it('should forward partial options (only rootModel)', async () => {
    mockRunJavaValidation.mockResolvedValue({ passed: true })

    const options: ValidationOptions = {
      rootModel: 'be.vlaanderen.validator.model.Person',
    }

    await runValidation('spec.json', options)

    expect(mockRunJavaValidation).toHaveBeenCalledWith('spec.json', options)
  })

  it('should forward partial options (only examples)', async () => {
    mockRunJavaValidation.mockResolvedValue({ passed: true })

    const options: ValidationOptions = {
      examples: ['example.json'],
    }

    await runValidation('spec.json', options)

    expect(mockRunJavaValidation).toHaveBeenCalledWith('spec.json', options)
  })

  it('should forward generatorOptions to runJavaValidation', async () => {
    mockRunJavaValidation.mockResolvedValue({ passed: true })

    const options: ValidationOptions = {
      generatorOptions: {
        useSpringBoot3: 'false',
        openApiNullable: 'false',
      },
    }

    await runValidation('spec.json', options)

    expect(mockRunJavaValidation).toHaveBeenCalledWith('spec.json', options)
  })

  it('should forward all options combined (rootModel + examples + generatorOptions)', async () => {
    mockRunJavaValidation.mockResolvedValue({ passed: true })

    const options: ValidationOptions = {
      rootModel: 'be.vlaanderen.validator.model.Person',
      examples: ['example.json'],
      generatorOptions: {
        useSpringBoot3: 'false',
      },
    }

    await runValidation('spec.json', options)

    expect(mockRunJavaValidation).toHaveBeenCalledWith('spec.json', options)
  })
})