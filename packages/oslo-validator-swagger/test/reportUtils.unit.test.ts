/**
 * @group unit
 */
import { formatMarkdownReport } from '../lib/utils/reportUtils'
import type { ValidationSuiteResult } from '../lib/types/Validator'

describe('formatMarkdownReport', () => {
  it('should format a passing report', () => {
    const result: ValidationSuiteResult = {
      javaValidation: { passed: true },
      passed: true,
    }

    const output = formatMarkdownReport(result)

    expect(output).toContain('# OSLO Swagger Validation Report')
    expect(output).toContain('✅ Passed')
    expect(output).not.toContain('## Errors')
  })

  it('should format a failing report with a message', () => {
    const result: ValidationSuiteResult = {
      javaValidation: {
        passed: false,
        message: 'Spec validation failed: missing required field',
      },
      passed: false,
    }

    const output = formatMarkdownReport(result)

    expect(output).toContain('❌ Failed')
    expect(output).toContain('## Errors')
    expect(output).toContain('Spec validation failed: missing required field')
  })

  it('should format a failing report without a message', () => {
    const result: ValidationSuiteResult = {
      javaValidation: { passed: false },
      passed: false,
    }

    const output = formatMarkdownReport(result)

    expect(output).toContain('❌ Failed')
    expect(output).not.toContain('## Errors')
  })

  it('should format a passing report even when javaValidation has a message', () => {
    const result: ValidationSuiteResult = {
      javaValidation: {
        passed: true,
        message: 'All good',
      },
      passed: true,
    }

    const output = formatMarkdownReport(result)

    expect(output).toContain('✅ Passed')
    // Message should not appear in errors section when passed
    expect(output).not.toContain('## Errors')
  })
})