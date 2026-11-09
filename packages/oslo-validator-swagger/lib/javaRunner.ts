import { execSync } from 'child_process'
import { resolve, dirname, join } from 'path'
import { mkdtempSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { createLogger } from '@oslo-flanders/core/lib/logging/LogUtil'
import { fetchFileOrUrl } from '@oslo-flanders/core'
import type { Logger } from '@oslo-flanders/core/lib/logging/Logger'
import type { JavaValidationReport } from './types/Validator'
import {
  DOCKER_IMAGE,
  COMPANION_FILES,
  DEFAULT_SPEC_FILENAME,
  SPEC_MOUNT_DIR,
  DOCKER_TIMEOUT_MS,
  DOCKER_MAX_BUFFER,
  TMP_DIR_PREFIX,
} from './constants/Validator'

async function resolveSpec(specFile: string): Promise<{ dir: string; filename: string }> {
  if (specFile.startsWith('http://') || specFile.startsWith('https://')) {
    const tmpDir = mkdtempSync(join(tmpdir(), TMP_DIR_PREFIX))
    const filename = specFile.split('/').pop() || DEFAULT_SPEC_FILENAME

    const logger: Logger = createLogger()
    logger.info(`Downloading spec from URL: ${specFile}`)
    const buffer = await fetchFileOrUrl(specFile)
    writeFileSync(join(tmpDir, filename), buffer)
    logger.info(`Saved to temporary directory: ${tmpDir}/${filename}`)

    // Download known companion files that might be referenced via relative $ref
    const baseUrl = specFile.substring(0, specFile.lastIndexOf('/') + 1)
    for (const companion of COMPANION_FILES) {
      try {
        const companionUrl = `${baseUrl}${companion}`
        logger.verbose(`Attempting to download companion file: ${companionUrl}`)
        const companionBuffer = await fetchFileOrUrl(companionUrl)
        writeFileSync(join(tmpDir, companion), companionBuffer)
        logger.verbose(`Companion file saved: ${companion}`)
      } catch {
        // Companion file not available, that's fine
      }
    }

    return { dir: tmpDir, filename }
  }

  const absolute = resolve(process.cwd(), specFile)
  return {
    dir: dirname(absolute),
    filename: absolute.split('/').pop() || DEFAULT_SPEC_FILENAME,
  }
}

export async function runJavaValidation(specFile: string): Promise<JavaValidationReport> {
  const logger: Logger = createLogger()

  const { dir: specDir, filename: specFilename } = await resolveSpec(specFile)

  logger.info(`Validating spec: ${specFilename}`)

  const command =
    `docker run --rm ` +
    `-v "${specDir}:${SPEC_MOUNT_DIR}" ` +
    `${DOCKER_IMAGE} ` +
    `--input=${SPEC_MOUNT_DIR}/${specFilename}`

  logger.verbose(`Running: ${command}`)

  let stdout: string
  try {
    stdout = execSync(command, {
      encoding: 'utf-8',
      timeout: DOCKER_TIMEOUT_MS,
      maxBuffer: DOCKER_MAX_BUFFER,
    })
    logger.info('Code generation completed successfully')
  } catch (err: any) {
    stdout = err?.stdout || ''
    if (!stdout) {
      logger.error(`Docker execution failed: ${err?.message || err}`)
      return { passed: false, message: `Docker execution failed: ${err?.message || err}` }
    }
    logger.warn('Code generation reported errors (see above)')
  }

  try {
    return JSON.parse(stdout) as JavaValidationReport
  } catch {
    const msg =
      `Failed to parse validation result from container output.\n` +
      `Ensure the Docker image is built:\n` +
      `  docker build -t ${DOCKER_IMAGE} -f packages/oslo-validator-swagger/Dockerfile .\n\n` +
      `Container output:\n${stdout.slice(0, 2000)}`

    logger.error(msg)
    return { passed: false, message: msg }
  }
}
