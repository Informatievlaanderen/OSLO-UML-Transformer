import { runJavaValidation } from './javaRunner'
import type { ValidationSuiteResult } from './types/Validator'

export async function runValidation(specFile: string): Promise<ValidationSuiteResult> {
  const javaResult = await runJavaValidation(specFile)

  return {
    javaValidation: javaResult,
    passed: javaResult.passed,
  }
}
