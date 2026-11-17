import { execSync } from 'child_process'
import { resolve, dirname, join } from 'path'
import { mkdtempSync, writeFileSync, existsSync } from 'fs'
import { tmpdir } from 'os'
import { createLogger } from '@oslo-flanders/core/lib/logging/LogUtil'
import { fetchFileOrUrl } from '@oslo-flanders/core'
import type { Logger } from '@oslo-flanders/core/lib/logging/Logger'
import type { JavaValidationReport, ValidationOptions } from './types/Validator'
import {
  DOCKER_IMAGE,
  COMPANION_FILES,
  DEFAULT_SPEC_FILENAME,
  SPEC_MOUNT_DIR,
  DOCKER_TIMEOUT_MS,
  DOCKER_MAX_BUFFER,
  TMP_DIR_PREFIX,
} from './constants/Validator'

export async function resolveSpec(specFile: string): Promise<{ dir: string; filename: string }> {
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
        logger.info(`Attempting to download companion file: ${companionUrl}`)
        const companionBuffer = await fetchFileOrUrl(companionUrl)
        writeFileSync(join(tmpDir, companion), companionBuffer)
        logger.info(`Companion file saved: ${companion}`)
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

/**
 * Resolve example files: download URLs to a temp directory, keep local paths as-is.
 * Returns the directory containing all examples and the list of filenames.
 */
export async function resolveExamples(
  examples: string[],
  specDir: string,
): Promise<{ exampleFilenames: string[] }> {
  const logger: Logger = createLogger()
  const exampleFilenames: string[] = []

  for (let i = 0; i < examples.length; i++) {
    const example = examples[i]
    if (example.startsWith('http://') || example.startsWith('https://')) {
      logger.info(`Downloading example file from URL: ${example}`)
      const buffer = await fetchFileOrUrl(example)
      const filename = example.split('/').pop() || `example-${i}.json`
      writeFileSync(join(specDir, filename), buffer)
      exampleFilenames.push(filename)
      logger.info(`Example saved to: ${specDir}/${filename}`)
    } else {
      // Local file: copy it into the spec directory so Docker can access it
      const absolute = resolve(process.cwd(), example)
      const filename = absolute.split('/').pop() || `example-${i}.json`
      const buffer = await fetchFileOrUrl(absolute)
      writeFileSync(join(specDir, filename), buffer)
      exampleFilenames.push(filename)
      logger.info(`Example copied to: ${specDir}/${filename}`)
    }
  }

  return { exampleFilenames }
}

/**
 * Check if the Docker image exists locally.
 */
function imageExists(imageName: string): boolean {
  try {
    execSync(`docker image inspect ${imageName}`, {
      encoding: 'utf-8',
      stdio: 'ignore',
    })
    return true
  } catch {
    return false
  }
}

/**
 * Find the repository root by walking up from cwd until we find a known marker.
 * Markers checked (in order): .git directory, lerna.json, package.json with "lerna" in scripts.
 */
function findRepoRoot(): string {
  let dir = process.cwd()
  while (true) {
    if (existsSync(join(dir, '.git'))) {
      return dir
    }
    if (existsSync(join(dir, 'lerna.json'))) {
      return dir
    }
    const parent = dirname(dir)
    if (parent === dir) {
      // Reached filesystem root without finding a marker — fall back to cwd
      return process.cwd()
    }
    dir = parent
  }
}

/**
 * Build the Docker image from the project's Dockerfile.
 * Finds the repository root automatically, so it works from any working directory.
 */
function buildDockerImage(logger: Logger): void {
  const repoRoot = findRepoRoot()
  logger.info(`Docker image "${DOCKER_IMAGE}" not found. Building from repo root: ${repoRoot}...`)
  const dockerfile = join(repoRoot, 'packages/oslo-validator-swagger/Dockerfile')
  execSync(`docker build -t ${DOCKER_IMAGE} -f "${dockerfile}" "${repoRoot}"`, {
    encoding: 'utf-8',
    stdio: 'inherit',
    timeout: DOCKER_TIMEOUT_MS,
  })
  logger.info(`Docker image "${DOCKER_IMAGE}" built successfully`)
}

export async function runJavaValidation(
  specFile: string,
  options?: ValidationOptions,
): Promise<JavaValidationReport> {
  const logger: Logger = createLogger()

  // Auto-build the Docker image if it doesn't exist yet
  if (!imageExists(DOCKER_IMAGE)) {
    buildDockerImage(logger)
  }

  const { dir: specDir, filename: specFilename } = await resolveSpec(specFile)

  logger.info(`Validating spec: ${specFilename}`)

  // Build Docker arguments
  const dockerArgs: string[] = [
    `--input=${SPEC_MOUNT_DIR}/${specFilename}`,
  ]

  // Resolve and mount example files if provided
  if (options?.examples && options.examples.length > 0) {
    const { exampleFilenames } = await resolveExamples(options.examples, specDir)

    if (options.rootModel) {
      dockerArgs.push(`--root-model=${options.rootModel}`)
    }

    const examplePaths = exampleFilenames
      .map((f) => `${SPEC_MOUNT_DIR}/${f}`)
      .join(',')
    dockerArgs.push(`--examples=${examplePaths}`)
  }

  // Pass generator configOptions overrides (written to a YAML config file inside the container)
  if (options?.generatorOptions) {
    for (const [key, value] of Object.entries(options.generatorOptions)) {
      dockerArgs.push(`--generator-option=${key}=${value}`)
    }
  }

  const command =
    `docker run --rm ` +
    `-v "${specDir}:${SPEC_MOUNT_DIR}" ` +
    `${DOCKER_IMAGE} ` +
    dockerArgs.join(' ')

  logger.info(`Running: ${command}`)

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
      `Container output:\n${stdout.slice(0, 2000)}`

    logger.error(msg)
    return { passed: false, message: msg }
  }
}
