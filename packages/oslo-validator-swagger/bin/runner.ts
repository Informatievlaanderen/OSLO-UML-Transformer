#!/usr/bin/env node
import yargs from 'yargs'
import { createLogger } from '@oslo-flanders/core/lib/logging/LogUtil'
import type { Logger } from '@oslo-flanders/core/lib/logging/Logger'
import { formatMarkdownReport } from '../lib/utils/reportUtils'
import type { ValidationSuiteResult } from '../lib/types/Validator'
import { VALIDATION_SUITES } from '../lib/constants/Validator'

class SwaggerValidatorRunner {
  private logger: Logger = createLogger()

  public runCli(argv: NodeJS.Process['argv']): void {
    yargs(argv.slice(2))
      .usage('oslo-validator-swagger [args]')
      .option('input', {
        describe: 'Path or URL to the OpenAPI Swagger file',
        type: 'string',
        demandOption: true,
      })
      .option('suite', {
        describe: 'Validation suite(s) to run. Repeat for multiple: --suite java --suite dotnet',
        type: 'string',
        array: true,
        default: ['java'],
        choices: VALIDATION_SUITES.map(s => s.name),
      })
      .option('logLevel', {
        describe: 'Log level',
        type: 'string',
        default: 'info',
        choices: ['error', 'warn', 'info', 'verbose', 'debug', 'silly'],
      })
      .option('silent', {
        describe: 'Suppress all logging output',
        type: 'boolean',
        default: false,
      })
      .help('h')
      .alias('h', 'help')
      .parseAsync()
      .then(async (params) => {
        if (!params.silent) {
          const { setLoggerFactory } = await import('@oslo-flanders/core/lib/logging/LogUtil')
          setLoggerFactory(params as any)
          this.logger = createLogger()
        }

        const input = params.input as string
        const suites = params.suite as string[]

        this.logger.info(`Input spec: ${input}`)
        this.logger.info(`Validation suites: ${suites.join(', ')}`)

        const results: ValidationSuiteResult[] = []

        for (const suiteName of suites) {
          const runner = VALIDATION_SUITES.find(s => s.name === suiteName)
          if (!runner) {
            this.logger.error(`Unknown validation suite: ${suiteName}`)
            process.exit(1)
          }

          this.logger.info(`Running ${suiteName} validation suite...`)
          const javaResult = await runner.run(input)

          results.push({
            javaValidation: javaResult,
            passed: javaResult.passed,
          })
        }

        const allPassed = results.every(r => r.passed)

        if (allPassed) {
          this.logger.info('All validation suites passed')
        } else {
          this.logger.error('One or more validation suites failed')
        }

        if (suites.length === 1) {
          console.log(formatMarkdownReport(results[0]))
        } else {
          const combined: ValidationSuiteResult = {
            javaValidation: {
              passed: allPassed,
              message: results.some(r => r.javaValidation.message)
                ? results.map(r => r.javaValidation.message).filter(Boolean).join('; ')
                : undefined,
            },
            passed: allPassed,
          }
          console.log(formatMarkdownReport(combined))
        }

        process.exit(allPassed ? 0 : 1)
      })
      .catch((error) => {
        console.error(error)
        process.exit(1)
      })
  }
}

new SwaggerValidatorRunner().runCli(process.argv)
