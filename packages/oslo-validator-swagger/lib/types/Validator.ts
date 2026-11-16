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
  run: (specFile: string, options?: ValidationOptions) => Promise<JavaValidationReport>
}

export interface ValidationOptions {
  /** Fully-qualified class name of the root model for round-trip deserialization */
  rootModel?: string
  /** Example JSON files (local paths or URLs) for round-trip validation */
  examples?: string[]
}
