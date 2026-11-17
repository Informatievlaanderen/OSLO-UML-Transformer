#!/usr/bin/env node
import yargs from 'yargs'
import { createLogger } from '@oslo-flanders/core/lib/logging/LogUtil'
import type { Logger } from '@oslo-flanders/core/lib/logging/Logger'
import { formatMarkdownReport } from '../lib/utils/reportUtils'
import type { ValidationSuiteResult, ValidationOptions } from '../lib/types/Validator'
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
      .option('root-model', {
        describe: 'Fully-qualified class name of the root model for round-trip JSON validation (e.g. be.vlaanderen.validator.model.PersonEnvelope)',
        type: 'string',
      })
      .option('examples', {
        describe: 'Example JSON files (local paths or URLs) for round-trip validation. Repeat for multiple: --examples file1.json --examples https://...',
        type: 'string',
        array: true,
      })
      .option('generator-option', {
        describe: 'Override openapi-generator configOptions. Format: key=value. Repeat for multiple: --generator-option useSpringBoot3=false --generator-option openApiNullable=false',
        type: 'string',
        array: true,
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
        const rootModel = params['root-model'] as string | undefined
        const examples = params.examples as string[] | undefined
        const generatorOptionsRaw = params['generator-option'] as string[] | undefined

        this.logger.info(`Input spec: ${input}`)
        this.logger.info(`Validation suites: ${suites.join(', ')}`)

        if (rootModel) {
          this.logger.info(`Root model for round-trip: ${rootModel}`)
        }
        if (examples && examples.length > 0) {
          this.logger.info(`Example files: ${examples.join(', ')}`)
        }

        const validationOptions: ValidationOptions = {}
        if (rootModel) {
          validationOptions.rootModel = rootModel
        }
        if (examples && examples.length > 0) {
          validationOptions.examples = examples
        }
        if (generatorOptionsRaw && generatorOptionsRaw.length > 0) {
          const generatorOptions: Record<string, string> = {}
          for (const opt of generatorOptionsRaw) {
            const eqIdx = opt.indexOf('=')
            if (eqIdx > 0) {
              const key = opt.substring(0, eqIdx)
              const value = opt.substring(eqIdx + 1)
              generatorOptions[key] = value
              this.logger.info(`Generator option: ${key}=${value}`)
            } else {
              this.logger.warn(`Skipping malformed generator option (expected key=value): ${opt}`)
            }
          }
          validationOptions.generatorOptions = generatorOptions
        }

        const results: ValidationSuiteResult[] = []

        for (const suiteName of suites) {
          const runner = VALIDATION_SUITES.find(s => s.name === suiteName)
          if (!runner) {
            this.logger.error(`Unknown validation suite: ${suiteName}`)
            process.exit(1)
          }

          this.logger.info(`Running ${suiteName} validation suite...`)
          const javaResult = await runner.run(input, validationOptions)

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
