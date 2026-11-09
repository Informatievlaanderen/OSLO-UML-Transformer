/**
 * Docker image name for the Java validation suite.
 * Built from the repository root with:
 *   docker build -t oslo-swagger-validator-java -f packages/oslo-validator-swagger/Dockerfile .
 */
export const DOCKER_IMAGE = 'oslo-swagger-validator-java'

/**
 * Known companion files that specs reference via relative $ref.
 * These are downloaded alongside the spec when the input is a URL.
 */
export const COMPANION_FILES = ['components.json']

/**
 * Default filename for downloaded specs.
 */
export const DEFAULT_SPEC_FILENAME = 'spec.json'

/**
 * Docker mount target for the spec directory.
 */
export const SPEC_MOUNT_DIR = '/spec'

/**
 * Timeout for Docker execution in milliseconds.
 */
export const DOCKER_TIMEOUT_MS = 300_000

/**
 * Max buffer size for Docker stdout capture.
 */
export const DOCKER_MAX_BUFFER = 10 * 1024 * 1024

/**
 * Temporary directory prefix for downloaded specs.
 */
export const TMP_DIR_PREFIX = 'oslo-validator-'
