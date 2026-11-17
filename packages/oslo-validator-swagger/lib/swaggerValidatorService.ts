import { runJavaValidation } from './javaRunner'
import type { ValidationSuiteResult, ValidationOptions } from './types/Validator'

export async function runValidation(
  specFile: string,
  options?: ValidationOptions,
): Promise<ValidationSuiteResult> {
  const javaResult = await runJavaValidation(specFile, options)

  return {
    javaValidation: javaResult,
    passed: javaResult.passed,
  }
}
