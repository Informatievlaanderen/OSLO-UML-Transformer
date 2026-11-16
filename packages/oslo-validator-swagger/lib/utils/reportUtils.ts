import type { ValidationSuiteResult } from '../types/Validator'

export function formatMarkdownReport(result: ValidationSuiteResult): string {
  let md = '# OSLO Swagger Validation Report\n\n'
  md += `**Status:** ${result.passed ? '✅ Passed' : '❌ Failed'}\n\n`

  if (!result.passed && result.javaValidation.message) {
    md += '## Errors\n\n'
    md += '```\n'
    md += `${result.javaValidation.message}\n`
    md += '```\n\n'
  }

  return md
}
