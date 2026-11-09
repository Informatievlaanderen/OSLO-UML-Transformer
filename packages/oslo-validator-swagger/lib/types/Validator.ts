export interface JavaValidationReport {
  passed: boolean
  message?: string
}

export interface ValidationSuiteResult {
  javaValidation: JavaValidationReport
  passed: boolean
}
