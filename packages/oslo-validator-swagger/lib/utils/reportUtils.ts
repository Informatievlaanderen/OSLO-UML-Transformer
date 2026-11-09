import type { ValidationSuiteResult } from '../types/Validator'

export function formatMarkdownReport(result: ValidationSuiteResult): string {
  let md = '# OSLO Swagger Validation Report\n\n'
  md += `**Status:** ${result.passed ? '✅ Passed' : '❌ Failed'}\n\n`

  if (!result.passed && result.javaValidation.message) {
    md += `${result.javaValidation.message}\n\n`
  }

  return md
}
