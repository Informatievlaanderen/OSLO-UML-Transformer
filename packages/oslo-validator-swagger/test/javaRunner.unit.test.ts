/**
 * @group unit
 */
import { execSync } from 'child_process'
import { resolve, join } from 'path'
import { mkdtempSync, writeFileSync, existsSync, readFileSync } from 'fs'
import { tmpdir } from 'os'
import { fetchFileOrUrl } from '@oslo-flanders/core'
import { resolveSpec, resolveExamples, runJavaValidation } from '../lib/javaRunner'
import type { JavaValidationReport, ValidationOptions } from '../lib/types/Validator'
import {
  DOCKER_IMAGE,
  COMPANION_FILES,
  DEFAULT_SPEC_FILENAME,
  SPEC_MOUNT_DIR,
  TMP_DIR_PREFIX,
} from '../lib/constants/Validator'

// Mock child_process.execSync
jest.mock('child_process', () => ({
  execSync: jest.fn(),
}))

// Mock @oslo-flanders/core
jest.mock('@oslo-flanders/core', () => ({
  fetchFileOrUrl: jest.fn(),
}))

// Mock fs functions
jest.mock('fs', () => {
  const actual = jest.requireActual('fs')
  return {
    ...actual,
    mkdtempSync: jest.fn(),
    writeFileSync: jest.fn(),
    existsSync: jest.fn(),
    readFileSync: jest.fn(),
  }
})

// Mock process.cwd to return a predictable path
const mockCwd = jest.spyOn(process, 'cwd').mockReturnValue('/repo/packages/oslo-validator-swagger')

// Mock os.tmpdir
jest.mock('os', () => ({
  tmpdir: jest.fn(() => '/tmp'),
}))

// Mock path.resolve to keep it predictable
jest.mock('path', () => {
  const actual = jest.requireActual('path')
  return {
    ...actual,
    resolve: jest.fn(),
  }
})

describe('resolveSpec', () => {
  const mockTmpDir = '/tmp/oslo-validator-test123'
  const mockFetchFileOrUrl = fetchFileOrUrl as jest.Mock
  const mockMkdtempSync = mkdtempSync as jest.Mock
  const mockWriteFileSync = writeFileSync as jest.Mock
  const mockResolve = resolve as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockMkdtempSync.mockReturnValue(mockTmpDir)
    mockFetchFileOrUrl.mockResolvedValue(Buffer.from('{}'))
  })

  it('should resolve a local file path', async () => {
    mockResolve.mockImplementation((...args: string[]) => {
      // Simulate path.resolve behavior
      if (args.length === 2 && args[0] === process.cwd()) {
        return `/cwd/${args[1]}`
      }
      return actualResolve(...args)
    })

    const result = await resolveSpec('spec.json')

    expect(result.dir).toBe('/cwd')
    expect(result.filename).toBe('spec.json')
    expect(mockMkdtempSync).not.toHaveBeenCalled()
    expect(mockFetchFileOrUrl).not.toHaveBeenCalled()
  })

  it('should resolve a local file path with directory prefix', async () => {
    mockResolve.mockImplementation((...args: string[]) => {
      if (args.length === 2 && args[0] === process.cwd()) {
        // Simulate path.resolve: join cwd with the relative path
        return `/cwd/${args[1]}`
      }
      return actualResolve(...args)
    })

    const result = await resolveSpec('path/to/spec.json')

    expect(result.dir).toBe('/cwd/path/to')
    expect(result.filename).toBe('spec.json')
  })

  it('should download a spec from a URL', async () => {
    mockFetchFileOrUrl.mockResolvedValue(Buffer.from('{"openapi":"3.0.0"}'))

    const result = await resolveSpec('https://example.com/spec.json')

    expect(result.dir).toBe(mockTmpDir)
    expect(result.filename).toBe('spec.json')
    expect(mockMkdtempSync).toHaveBeenCalledWith(expect.stringContaining(TMP_DIR_PREFIX))
    expect(mockFetchFileOrUrl).toHaveBeenCalledWith('https://example.com/spec.json')
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      join(mockTmpDir, 'spec.json'),
      Buffer.from('{"openapi":"3.0.0"}'),
    )
  })

  it('should download companion files alongside a URL spec', async () => {
    mockFetchFileOrUrl
      .mockResolvedValueOnce(Buffer.from('{"openapi":"3.0.0"}')) // spec
      .mockResolvedValueOnce(Buffer.from('{"components":{}}')) // companion

    await resolveSpec('https://example.com/spec.json')

    // Should have attempted to download companion files
    expect(mockFetchFileOrUrl).toHaveBeenCalledWith('https://example.com/components.json')
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      join(mockTmpDir, 'components.json'),
      Buffer.from('{"components":{}}'),
    )
  })

  it('should handle companion file download failures gracefully', async () => {
    mockFetchFileOrUrl
      .mockResolvedValueOnce(Buffer.from('{"openapi":"3.0.0"}')) // spec
      .mockRejectedValueOnce(new Error('Not found')) // companion fails

    // Should not throw
    const result = await resolveSpec('https://example.com/spec.json')

    expect(result.dir).toBe(mockTmpDir)
    expect(result.filename).toBe('spec.json')
  })

  it('should use default filename when URL has no filename', async () => {
    mockFetchFileOrUrl.mockResolvedValue(Buffer.from('{}'))

    const result = await resolveSpec('https://example.com/')

    expect(result.filename).toBe(DEFAULT_SPEC_FILENAME)
  })
})

describe('resolveExamples', () => {
  const specDir = '/spec-dir'
  const mockFetchFileOrUrl = fetchFileOrUrl as jest.Mock
  const mockWriteFileSync = writeFileSync as jest.Mock
  const mockResolve = resolve as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetchFileOrUrl.mockResolvedValue(Buffer.from('{"example":true}'))
  })

  it('should download example files from URLs', async () => {
    const result = await resolveExamples(
      ['https://example.com/example1.json', 'https://example.com/example2.json'],
      specDir,
    )

    expect(result.exampleFilenames).toEqual(['example1.json', 'example2.json'])
    expect(mockFetchFileOrUrl).toHaveBeenCalledWith('https://example.com/example1.json')
    expect(mockFetchFileOrUrl).toHaveBeenCalledWith('https://example.com/example2.json')
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      join(specDir, 'example1.json'),
      Buffer.from('{"example":true}'),
    )
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      join(specDir, 'example2.json'),
      Buffer.from('{"example":true}'),
    )
  })

  it('should copy local example files into spec directory', async () => {
    mockResolve.mockImplementation((...args: string[]) => {
      if (args.length === 2 && args[0] === process.cwd()) {
        return `/cwd/${args[1]}`
      }
      return actualResolve(...args)
    })

    const result = await resolveExamples(
      ['local-example.json'],
      specDir,
    )

    expect(result.exampleFilenames).toEqual(['local-example.json'])
    expect(mockFetchFileOrUrl).toHaveBeenCalledWith('/cwd/local-example.json')
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      join(specDir, 'local-example.json'),
      Buffer.from('{"example":true}'),
    )
  })

  it('should generate fallback filenames for URLs without a filename', async () => {
    const result = await resolveExamples(
      ['https://example.com/'],
      specDir,
    )

    expect(result.exampleFilenames).toEqual(['example-0.json'])
  })

  it('should handle an empty examples array', async () => {
    const result = await resolveExamples([], specDir)

    expect(result.exampleFilenames).toEqual([])
    expect(mockFetchFileOrUrl).not.toHaveBeenCalled()
  })
})

describe('runJavaValidation', () => {
  const mockExecSync = execSync as jest.Mock
  const mockFetchFileOrUrl = fetchFileOrUrl as jest.Mock
  const mockMkdtempSync = mkdtempSync as jest.Mock
  const mockWriteFileSync = writeFileSync as jest.Mock
  const mockResolve = resolve as jest.Mock
  const mockExistsSync = existsSync as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockMkdtempSync.mockReturnValue('/tmp/oslo-validator-test123')
    mockResolve.mockImplementation((...args: string[]) => {
      if (args.length === 2 && args[0] === process.cwd()) {
        return `/cwd/${args[1]}`
      }
      return actualResolve(...args)
    })
    // Make findRepoRoot find the repo root via .git
    mockExistsSync.mockImplementation((path: string) => {
      if (path === '/repo/.git') {
        return true
      }
      return actualExistsSync(path)
    })
  })

  it('should auto-build the Docker image when it does not exist', async () => {
    // First call: image inspect fails (image not found)
    // Second call: docker build succeeds
    // Third call: docker run succeeds
    mockExecSync
      .mockImplementationOnce(() => { throw new Error('Image not found') }) // image inspect
      .mockImplementationOnce(() => '') // docker build
      .mockReturnValue(JSON.stringify({ passed: true })) // docker run

    const result = await runJavaValidation('spec.json')

    expect(result.passed).toBe(true)
    // Should have called docker build
    expect(mockExecSync.mock.calls[0][0]).toContain('docker image inspect')
    expect(mockExecSync.mock.calls[1][0]).toContain('docker build')
    expect(mockExecSync.mock.calls[1][0]).toContain(DOCKER_IMAGE)
    // Should use the correct Dockerfile path from repo root
    expect(mockExecSync.mock.calls[1][0]).toContain('packages/oslo-validator-swagger/Dockerfile')
  })

  it('should not build the Docker image when it already exists', async () => {
    // First call: image inspect succeeds
    // Second call: docker run succeeds
    mockExecSync
      .mockImplementationOnce(() => '') // image inspect succeeds
      .mockReturnValue(JSON.stringify({ passed: true })) // docker run

    const result = await runJavaValidation('spec.json')

    expect(result.passed).toBe(true)
    // Should NOT have called docker build
    const buildCalls = mockExecSync.mock.calls.filter(
      (call: any) => typeof call[0] === 'string' && call[0].includes('docker build'),
    )
    expect(buildCalls).toHaveLength(0)
  })

  it('should run Docker with a local spec file and return passed result', async () => {
    // image inspect succeeds, then docker run
    mockExecSync
      .mockImplementationOnce(() => '')
      .mockReturnValue(JSON.stringify({ passed: true }))

    const result = await runJavaValidation('spec.json')

    expect(result.passed).toBe(true)
    // The last call should be the docker run
    const lastCall = mockExecSync.mock.calls[mockExecSync.mock.calls.length - 1][0]
    expect(lastCall).toContain('docker run --rm')
    expect(lastCall).toContain(`-v "/cwd:${SPEC_MOUNT_DIR}"`)
    expect(lastCall).toContain(`--input=${SPEC_MOUNT_DIR}/spec.json`)
  })

  it('should run Docker with a URL spec file', async () => {
    mockFetchFileOrUrl.mockResolvedValue(Buffer.from('{"openapi":"3.0.0"}'))
    // image inspect succeeds, then docker run
    mockExecSync
      .mockImplementationOnce(() => '')
      .mockReturnValue(JSON.stringify({ passed: true }))

    const result = await runJavaValidation('https://example.com/spec.json')

    expect(result.passed).toBe(true)
    expect(mockFetchFileOrUrl).toHaveBeenCalledWith('https://example.com/spec.json')
  })

  it('should pass --root-model and --examples when options are provided', async () => {
    // image inspect succeeds, then docker run
    mockExecSync
      .mockImplementationOnce(() => '')
      .mockReturnValue(JSON.stringify({ passed: true }))
    mockFetchFileOrUrl.mockResolvedValue(Buffer.from('{"example":true}'))

    const options: ValidationOptions = {
      rootModel: 'be.vlaanderen.validator.model.PersonEnvelope',
      examples: ['https://example.com/example1.json'],
    }

    await runJavaValidation('spec.json', options)

    const lastCall = mockExecSync.mock.calls[mockExecSync.mock.calls.length - 1][0]
    expect(lastCall).toContain(`--root-model=be.vlaanderen.validator.model.PersonEnvelope`)
    expect(lastCall).toContain(`--examples=${SPEC_MOUNT_DIR}/example1.json`)
  })

  it('should pass multiple example files as comma-separated list', async () => {
    // image inspect succeeds, then docker run
    mockExecSync
      .mockImplementationOnce(() => '')
      .mockReturnValue(JSON.stringify({ passed: true }))
    mockFetchFileOrUrl
      .mockResolvedValueOnce(Buffer.from('{"a":1}'))
      .mockResolvedValueOnce(Buffer.from('{"b":2}'))

    const options: ValidationOptions = {
      rootModel: 'be.vlaanderen.validator.model.Person',
      examples: [
        'https://example.com/ex1.json',
        'https://example.com/ex2.json',
      ],
    }

    await runJavaValidation('spec.json', options)

    const lastCall = mockExecSync.mock.calls[mockExecSync.mock.calls.length - 1][0]
    expect(lastCall).toContain(`--examples=${SPEC_MOUNT_DIR}/ex1.json,${SPEC_MOUNT_DIR}/ex2.json`)
  })

  it('should not pass example args when only rootModel is set without examples', async () => {
    // image inspect succeeds, then docker run
    mockExecSync
      .mockImplementationOnce(() => '')
      .mockReturnValue(JSON.stringify({ passed: true }))

    const options: ValidationOptions = {
      rootModel: 'be.vlaanderen.validator.model.Person',
    }

    await runJavaValidation('spec.json', options)

    const lastCall = mockExecSync.mock.calls[mockExecSync.mock.calls.length - 1][0]
    expect(lastCall).not.toContain('--root-model')
    expect(lastCall).not.toContain('--examples')
  })

  it('should pass generator options as --generator-option arguments', async () => {
    // image inspect succeeds, then docker run
    mockExecSync
      .mockImplementationOnce(() => '')
      .mockReturnValue(JSON.stringify({ passed: true }))

    const options: ValidationOptions = {
      generatorOptions: {
        useSpringBoot3: 'false',
        openApiNullable: 'false',
      },
    }

    await runJavaValidation('spec.json', options)

    const lastCall = mockExecSync.mock.calls[mockExecSync.mock.calls.length - 1][0]
    expect(lastCall).toContain('--generator-option=useSpringBoot3=false')
    expect(lastCall).toContain('--generator-option=openApiNullable=false')
  })

  it('should pass generator options alongside root-model and examples', async () => {
    // image inspect succeeds, then docker run
    mockExecSync
      .mockImplementationOnce(() => '')
      .mockReturnValue(JSON.stringify({ passed: true }))
    mockFetchFileOrUrl.mockResolvedValue(Buffer.from('{"example":true}'))

    const options: ValidationOptions = {
      rootModel: 'be.vlaanderen.validator.model.Person',
      examples: ['https://example.com/example1.json'],
      generatorOptions: {
        useSpringBoot3: 'false',
      },
    }

    await runJavaValidation('spec.json', options)

    const lastCall = mockExecSync.mock.calls[mockExecSync.mock.calls.length - 1][0]
    expect(lastCall).toContain('--root-model=be.vlaanderen.validator.model.Person')
    expect(lastCall).toContain(`--examples=${SPEC_MOUNT_DIR}/example1.json`)
    expect(lastCall).toContain('--generator-option=useSpringBoot3=false')
  })

  it('should handle empty generator options gracefully', async () => {
    // image inspect succeeds, then docker run
    mockExecSync
      .mockImplementationOnce(() => '')
      .mockReturnValue(JSON.stringify({ passed: true }))

    const options: ValidationOptions = {
      generatorOptions: {},
    }

    await runJavaValidation('spec.json', options)

    const lastCall = mockExecSync.mock.calls[mockExecSync.mock.calls.length - 1][0]
    expect(lastCall).not.toContain('--generator-option')
  })

  it('should return failure when Docker execution throws without stdout', async () => {
    // image inspect succeeds, then docker run fails
    mockExecSync
      .mockImplementationOnce(() => '')
      .mockImplementation(() => {
        const error = new Error('Docker not found')
        ;(error as any).stdout = ''
        throw error
      })

    const result = await runJavaValidation('spec.json')

    expect(result.passed).toBe(false)
    expect(result.message).toContain('Docker execution failed')
  })

  it('should parse stdout from Docker when execSync throws with stdout', async () => {
    // image inspect succeeds, then docker run fails with stdout
    mockExecSync
      .mockImplementationOnce(() => '')
      .mockImplementation(() => {
        const error = new Error('Validation failed')
        ;(error as any).stdout = JSON.stringify({ passed: false, message: 'Spec is invalid' })
        throw error
      })

    const result = await runJavaValidation('spec.json')

    expect(result.passed).toBe(false)
    expect(result.message).toBe('Spec is invalid')
  })

  it('should return failure when stdout is not valid JSON', async () => {
    // image inspect succeeds, then docker run returns garbage
    mockExecSync
      .mockImplementationOnce(() => '')
      .mockReturnValue('not json')

    const result = await runJavaValidation('spec.json')

    expect(result.passed).toBe(false)
    expect(result.message).toContain('Failed to parse validation result')
  })
})

// Helper to access the real implementations for mocks
const actualResolve = jest.requireActual('path').resolve
const actualExistsSync = jest.requireActual('fs').existsSync