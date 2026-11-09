export interface JavaValidationReport {
  passed: boolean
  message?: string
}

export interface ValidationSuiteResult {
  javaValidation: JavaValidationReport
  passed: boolean
}

export interface ValidationRunner {
  name: string
  run: (specFile: string) => Promise<JavaValidationReport>
}
