#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import { readFile, realpath, stat } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { isDeepStrictEqual, promisify } from 'node:util'

const execute = promisify(execFile)
const exactObjectId = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/u
const loopbackHosts = new Set(['127.0.0.1', '::1', '[::1]', 'localhost'])

class Blocker extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'Blocker'
    this.code = code
  }
}

function fail(code, message) {
  throw new Blocker(code, message)
}

function object(value, label, keys) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    fail('INVALID_MANIFEST', `${label} must be an object`)
  }
  const unknown = Object.keys(value).find(key => !keys.includes(key))
  if (unknown !== undefined) fail('INVALID_MANIFEST', `${label}.${unknown} is not supported`)
  return value
}

function string(value, label) {
  if (typeof value !== 'string' || value.trim() === '') {
    fail('INVALID_MANIFEST', `${label} must be a non-empty string`)
  }
  return value.trim()
}

function exactId(value, label) {
  const result = string(value, label)
  if (!exactObjectId.test(result) || /^0+$/u.test(result)) {
    fail('INVALID_MANIFEST', `${label} must be an exact nonzero Git object ID`)
  }
  return result
}

function array(value, label) {
  if (!Array.isArray(value)) fail('INVALID_MANIFEST', `${label} must be an array`)
  return value
}

function resolveFrom(base, value, label) {
  const declared = string(value, label)
  return path.resolve(base, declared)
}

async function gitOutput(checkout, args, trim) {
  try {
    const { stdout } = await execute('git', ['-C', checkout, ...args], {
      encoding: 'utf8',
      maxBuffer: 4 * 1024 * 1024,
    })
    return trim ? stdout.trim() : stdout
  } catch (error) {
    fail('GIT_READ_FAILED', `${checkout}: ${error.stderr?.trim() || error.message}`)
  }
}

async function git(checkout, ...args) {
  return gitOutput(checkout, args, true)
}

async function gitRaw(checkout, ...args) {
  return gitOutput(checkout, args, false)
}

async function sha256(file, label) {
  let bytes
  try {
    const metadata = await stat(file)
    if (!metadata.isFile()) fail('FILE_IDENTITY_MISMATCH', `${label} is not a regular file: ${file}`)
    bytes = await readFile(file)
  } catch (error) {
    if (error instanceof Blocker) throw error
    fail('FILE_READ_FAILED', `${label} could not be read: ${file}`)
  }
  return createHash('sha256').update(bytes).digest('hex')
}

function inside(root, target) {
  const relative = path.relative(root, target)
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))
}

async function fileReference(value, label, manifestRoot) {
  const source = object(value, label, ['path', 'sha256'])
  const declaredPath = resolveFrom(manifestRoot, source.path, `${label}.path`)
  let actualPath
  try {
    actualPath = await realpath(declaredPath)
  } catch {
    fail('FILE_READ_FAILED', `${label} path does not exist: ${declaredPath}`)
  }
  const expectedHash = string(source.sha256, `${label}.sha256`)
  if (!/^[0-9a-f]{64}$/u.test(expectedHash)) {
    fail('INVALID_MANIFEST', `${label}.sha256 must be a lowercase SHA-256 digest`)
  }
  const actualHash = await sha256(actualPath, label)
  if (actualHash !== expectedHash) {
    fail('FILE_HASH_MISMATCH', `${label} expected ${expectedHash} but read ${actualHash}`)
  }
  return { path: actualPath, sha256: actualHash }
}

async function configReference(value, label, manifestRoot) {
  const reference = await fileReference(value, label, manifestRoot)
  try {
    return { reference, document: JSON.parse(await readFile(reference.path, 'utf8')) }
  } catch (error) {
    fail('CONFIG_JSON_INVALID', `${label} is not valid JSON: ${error.message}`)
  }
}

function pointerValue(document, pointer, label) {
  if (pointer === '') return document
  if (typeof pointer !== 'string' || !pointer.startsWith('/')) {
    fail('INVALID_MANIFEST', `${label} must be an RFC 6901 JSON Pointer`)
  }
  let current = document
  for (const raw of pointer.slice(1).split('/')) {
    if (/~(?:[^01]|$)/u.test(raw)) fail('INVALID_MANIFEST', `${label} contains an invalid escape`)
    const token = raw.replaceAll('~1', '/').replaceAll('~0', '~')
    if (Array.isArray(current)) {
      if (!/^(?:0|[1-9][0-9]*)$/u.test(token) || Number(token) >= current.length) {
        fail('CONFIG_POINTER_MISSING', `${label} does not resolve: ${pointer}`)
      }
      current = current[Number(token)]
      continue
    }
    if (current === null || typeof current !== 'object' || !Object.hasOwn(current, token)) {
      fail('CONFIG_POINTER_MISSING', `${label} does not resolve: ${pointer}`)
    }
    current = current[token]
  }
  return current
}

async function configBindings(values, configuration, entries) {
  const bindings = []
  const ids = new Set()
  for (const [index, value] of array(values, 'configuration.bindings').entries()) {
    const label = `configuration.bindings[${index}]`
    const source = object(value, label, ['id', 'source', 'pointer', 'kind', 'entry', 'value'])
    const id = string(source.id, `${label}.id`)
    if (ids.has(id)) fail('INVALID_MANIFEST', `duplicate configuration binding id: ${id}`)
    ids.add(id)
    if (!['requested', 'stable-home', 'effective'].includes(source.source)) {
      fail('INVALID_MANIFEST', `${label}.source must be requested, stable-home, or effective`)
    }
    const config = source.source === 'requested'
      ? configuration.requested
      : source.source === 'stable-home'
      ? configuration.stableHome
      : configuration.effective
    if (config === null) fail('INVALID_MANIFEST', `${label}.source is not declared`)
    const pointer = typeof source.pointer === 'string'
      ? source.pointer
      : fail('INVALID_MANIFEST', `${label}.pointer must be a string`)
    const actual = pointerValue(config.document, pointer, `${label}.pointer`)
    if (source.kind === 'literal') {
      if (source.entry !== undefined || !Object.hasOwn(source, 'value')) {
        fail('INVALID_MANIFEST', `${label} literal requires value and forbids entry`)
      }
      if (!isDeepStrictEqual(actual, source.value)) {
        fail('CONFIG_LITERAL_MISMATCH', `${label} expected ${JSON.stringify(source.value)} at ${pointer}`)
      }
      bindings.push({ id, source: source.source, pointer, kind: source.kind, verified: true })
      continue
    }
    if (!['entry', 'file-url-of-entry'].includes(source.kind) || source.value !== undefined) {
      fail('INVALID_MANIFEST', `${label}.kind must be entry, file-url-of-entry, or literal`)
    }
    const entryId = string(source.entry, `${label}.entry`)
    const checkedEntry = entries.find(item => item.id === entryId)
    if (checkedEntry === undefined) fail('INVALID_MANIFEST', `${label}.entry is unknown: ${entryId}`)
    if (typeof actual !== 'string') fail('CONFIG_ENTRY_INVALID', `${label} must resolve to a string`)
    let declaredEntry
    try {
      declaredEntry = source.kind === 'entry'
        ? path.resolve(path.dirname(config.reference.path), actual)
        : fileURLToPath(actual)
    } catch {
      fail('CONFIG_ENTRY_INVALID', `${label} did not contain a valid ${source.kind}`)
    }
    let resolvedEntry
    try {
      resolvedEntry = await realpath(declaredEntry)
    } catch {
      fail('EFFECTIVE_CONFIG_ENTRY_MISMATCH', `${label} entry does not exist: ${declaredEntry}`)
    }
    if (resolvedEntry !== checkedEntry.path) {
      const code = source.source === 'effective' ? 'EFFECTIVE_CONFIG_ENTRY_MISMATCH' : 'CONFIG_ENTRY_MISMATCH'
      fail(code, `${label} expected ${checkedEntry.path} but config points to ${resolvedEntry}`)
    }
    bindings.push({ id, source: source.source, pointer, kind: source.kind, entry: entryId })
  }
  for (const checkedEntry of entries.filter(item => item.kind === 'consumer')) {
    if (!bindings.some(item => item.source === 'effective' && item.entry === checkedEntry.id)) {
      fail('CONFIG_ENTRY_UNBOUND', `effective config has no binding for consumer entry ${checkedEntry.id}`)
    }
  }
  return bindings
}

function dirtyDeclaration(value, label) {
  const declaration = object(value, label, ['state', 'reason', 'paths'])
  if (!['clean', 'declared'].includes(declaration.state)) {
    fail('INVALID_MANIFEST', `${label}.state must be clean or declared`)
  }
  if (declaration.state === 'clean') {
    if (declaration.reason !== undefined || declaration.paths !== undefined) {
      fail('INVALID_MANIFEST', `${label} clean state must not declare reason or paths`)
    }
    return { state: 'clean', paths: [] }
  }
  const reason = string(declaration.reason, `${label}.reason`)
  const paths = array(declaration.paths, `${label}.paths`).map((entry, index) =>
    string(entry, `${label}.paths[${index}]`)
  )
  if (paths.length === 0 || new Set(paths).size !== paths.length) {
    fail('INVALID_MANIFEST', `${label}.paths must contain unique dirty paths`)
  }
  return { state: 'declared', reason, paths: [...paths].sort() }
}

function statusPaths(output) {
  const records = output.split('\0').filter(Boolean)
  const paths = []
  for (let index = 0; index < records.length; index += 1) {
    const record = records[index]
    const status = record.slice(0, 2)
    paths.push(record.slice(3))
    if (status.includes('R') || status.includes('C')) index += 1
  }
  return [...new Set(paths)].sort()
}

async function repository(value, index, manifestRoot) {
  const label = `repositories[${index}]`
  const source = object(value, label, ['id', 'checkout', 'sha', 'tree', 'dirty'])
  const id = string(source.id, `${label}.id`)
  const checkoutPath = resolveFrom(manifestRoot, source.checkout, `${label}.checkout`)
  let checkout
  try {
    checkout = await realpath(checkoutPath)
  } catch {
    fail('REPOSITORY_UNAVAILABLE', `${id} checkout does not exist: ${checkoutPath}`)
  }
  const root = await git(checkout, 'rev-parse', '--show-toplevel')
  let realRoot
  try {
    realRoot = await realpath(root)
  } catch {
    fail('REPOSITORY_ROOT_MISMATCH', `${id} reported an unreadable Git root: ${root}`)
  }
  if (realRoot !== checkout) {
    fail(
      'REPOSITORY_ROOT_MISMATCH',
      `${id} checkout ${checkout} fell through to another repository root ${realRoot}`,
    )
  }
  const expectedSha = exactId(source.sha, `${label}.sha`)
  const actualSha = await git(checkout, 'rev-parse', 'HEAD')
  if (actualSha !== expectedSha) fail('SHA_MISMATCH', `${id} expected ${expectedSha} but HEAD is ${actualSha}`)
  const expectedTree = exactId(source.tree, `${label}.tree`)
  const actualTree = await git(checkout, 'rev-parse', 'HEAD^{tree}')
  if (actualTree !== expectedTree) fail('TREE_MISMATCH', `${id} expected tree ${expectedTree} but read ${actualTree}`)
  const dirty = dirtyDeclaration(source.dirty, `${label}.dirty`)
  const actualDirty = statusPaths(await gitRaw(checkout, 'status', '--porcelain=v1', '-z', '--untracked-files=all'))
  if (dirty.state === 'clean' && actualDirty.length > 0) {
    fail('UNDECLARED_DIRTY_TREE', `${id} has undeclared dirty paths: ${actualDirty.join(', ')}`)
  }
  if (dirty.state === 'declared' && JSON.stringify(actualDirty) !== JSON.stringify(dirty.paths)) {
    fail(
      'DIRTY_DECLARATION_MISMATCH',
      `${id} declared ${dirty.paths.join(', ')} but read ${actualDirty.join(', ') || 'clean'}`,
    )
  }
  return { id, checkout, sha: actualSha, tree: actualTree, dirty: dirty.state, dirtyPaths: actualDirty }
}

async function entry(value, index, repositories) {
  const label = `entries[${index}]`
  const source = object(value, label, ['id', 'kind', 'repository', 'path', 'sha256'])
  const id = string(source.id, `${label}.id`)
  if (!['host', 'consumer'].includes(source.kind)) {
    fail('INVALID_MANIFEST', `${label}.kind must be host or consumer`)
  }
  const owner = repositories.get(string(source.repository, `${label}.repository`))
  if (owner === undefined) fail('INVALID_MANIFEST', `${label}.repository is unknown`)
  const entryPath = string(source.path, `${label}.path`)
  const declared = path.isAbsolute(entryPath)
    ? path.resolve(entryPath)
    : path.resolve(owner.checkout, entryPath)
  let actual
  try {
    actual = await realpath(declared)
  } catch {
    fail('ENTRY_UNAVAILABLE', `${id} entry does not exist: ${declared}`)
  }
  if (!inside(owner.checkout, actual)) {
    fail('ENTRY_IDENTITY_MISMATCH', `${id} entry resolves outside ${owner.id}: ${actual}`)
  }
  const expectedHash = string(source.sha256, `${label}.sha256`)
  if (!/^[0-9a-f]{64}$/u.test(expectedHash)) {
    fail('INVALID_MANIFEST', `${label}.sha256 must be a lowercase SHA-256 digest`)
  }
  const actualHash = await sha256(actual, `${id} entry`)
  if (actualHash !== expectedHash) {
    fail('ENTRY_HASH_MISMATCH', `${id} expected ${expectedHash} but read ${actualHash}`)
  }
  return { id, kind: source.kind, repository: owner.id, path: actual, sha256: actualHash }
}

function revisionSet(value, label, repositories, requireCurrent) {
  const source = object(value, label, ['id', 'repositories'])
  const id = string(source.id, `${label}.id`)
  const revisions = object(source.repositories, `${label}.repositories`, [...repositories.keys()])
  const result = {}
  for (const [repositoryId, repositoryValue] of repositories) {
    const sha = exactId(revisions[repositoryId], `${label}.repositories.${repositoryId}`)
    if (requireCurrent && sha !== repositoryValue.sha) {
      fail('CANDIDATE_MISMATCH', `${repositoryId} candidate ${sha} does not match checked out ${repositoryValue.sha}`)
    }
    result[repositoryId] = sha
  }
  return { id, repositories: result }
}

function defaultRuntimeInspector() {
  return {
    async listenerPids(port) {
      try {
        const { stdout } = await execute('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-Fp'], {
          encoding: 'utf8',
        })
        return [
          ...new Set(stdout.split(/\r?\n/u).filter(line => /^p[0-9]+$/u.test(line)).map(line => Number(line.slice(1)))),
        ]
      } catch (error) {
        if (error.code === 1 && !error.stderr?.trim()) return []
        fail('PROCESS_INSPECTION_FAILED', `could not inspect TCP ${port}: ${error.message}`)
      }
    },
    async process(pid) {
      try {
        const [{ stdout: processOutput }, { stdout: cwdOutput }] = await Promise.all([
          execute('ps', ['-p', String(pid), '-o', 'user=', '-o', 'command='], { encoding: 'utf8' }),
          execute('lsof', ['-a', '-p', String(pid), '-d', 'cwd', '-Fn'], { encoding: 'utf8' }),
        ])
        const line = processOutput.trim()
        const separator = line.search(/\s/u)
        const cwdLine = cwdOutput.split(/\r?\n/u).find(entry => entry.startsWith('n'))
        if (separator < 1 || cwdLine === undefined) fail('PROCESS_INSPECTION_FAILED', `incomplete process ${pid}`)
        return { owner: line.slice(0, separator), command: line.slice(separator).trim(), cwd: cwdLine.slice(1) }
      } catch (error) {
        if (error instanceof Blocker) throw error
        fail('PROCESS_INSPECTION_FAILED', `could not inspect process ${pid}: ${error.message}`)
      }
    },
  }
}

async function runtime(value, repositories, entries, configuration, inspector, fetcher) {
  const source = object(value, 'runtime', ['state', 'expectedPort', 'process', 'http', 'identity'])
  if (!['running', 'not-running'].includes(source.state)) {
    fail('INVALID_MANIFEST', 'runtime.state must be running or not-running')
  }
  if (!Number.isInteger(source.expectedPort) || source.expectedPort < 1024 || source.expectedPort > 65535) {
    fail('INVALID_MANIFEST', 'runtime.expectedPort must be an integer from 1024 through 65535')
  }
  const identity = object(source.identity, 'runtime.identity', [
    'hostRepository',
    'consumerRepositories',
    'permissionBinding',
  ])
  const hostRepository = string(identity.hostRepository, 'runtime.identity.hostRepository')
  if (
    !repositories.has(hostRepository)
    || !entries.some(item => item.kind === 'host' && item.repository === hostRepository)
  ) {
    fail('RUNTIME_IDENTITY_MISMATCH', 'runtime host repository has no checked host entry')
  }
  const consumerRepositories = array(identity.consumerRepositories, 'runtime.identity.consumerRepositories').map(
    (item, index) => string(item, `runtime.identity.consumerRepositories[${index}]`),
  )
  for (const consumer of consumerRepositories) {
    if (
      !repositories.has(consumer) || !entries.some(item => item.kind === 'consumer' && item.repository === consumer)
    ) {
      fail('RUNTIME_IDENTITY_MISMATCH', `runtime consumer has no checked entry: ${consumer}`)
    }
  }
  const permissionBindingId = string(identity.permissionBinding, 'runtime.identity.permissionBinding')
  const permissionBinding = configuration.bindings.find(item => item.id === permissionBindingId)
  if (
    permissionBinding === undefined || permissionBinding.source !== 'effective' || permissionBinding.kind !== 'literal'
  ) {
    fail('EFFECTIVE_CONFIG_MISMATCH', 'runtime permission binding must be a validated effective literal')
  }
  const listenerPids = await inspector.listenerPids(source.expectedPort)
  if (source.state === 'not-running') {
    if (source.process !== null || source.http !== null) {
      fail('INVALID_MANIFEST', 'not-running runtime requires null process and http')
    }
    if (listenerPids.length > 0) {
      fail('UNEXPECTED_PORT_LISTENER', `TCP ${source.expectedPort} is owned by ${listenerPids.join(', ')}`)
    }
    return { state: source.state, expectedPort: source.expectedPort, httpReady: false, provenanceVerified: true }
  }
  const processDeclaration = object(source.process, 'runtime.process', [
    'pid',
    'owner',
    'cwd',
    'entry',
    'commandIncludes',
  ])
  if (!Number.isSafeInteger(processDeclaration.pid) || processDeclaration.pid < 1) {
    fail('INVALID_MANIFEST', 'runtime.process.pid must be a positive integer')
  }
  if (listenerPids.length !== 1 || listenerPids[0] !== processDeclaration.pid) {
    fail(
      'PORT_PROCESS_MISMATCH',
      `TCP ${source.expectedPort} expected PID ${processDeclaration.pid} but read ${listenerPids.join(', ') || 'none'}`,
    )
  }
  const observed = await inspector.process(processDeclaration.pid)
  const expectedOwner = string(processDeclaration.owner, 'runtime.process.owner')
  if (observed.owner !== expectedOwner) {
    fail(
      'PROCESS_OWNER_MISMATCH',
      `PID ${processDeclaration.pid} expected owner ${expectedOwner} but read ${observed.owner}`,
    )
  }
  let expectedCwd
  let actualCwd
  try {
    expectedCwd = await realpath(
      resolveFrom(path.dirname(configuration.manifestPath), processDeclaration.cwd, 'runtime.process.cwd'),
    )
    actualCwd = await realpath(observed.cwd)
  } catch {
    fail('PROCESS_CWD_MISMATCH', `PID ${processDeclaration.pid} has an unavailable declared or observed cwd`)
  }
  if (expectedCwd !== actualCwd) {
    fail('PROCESS_CWD_MISMATCH', `PID ${processDeclaration.pid} expected cwd ${expectedCwd} but read ${actualCwd}`)
  }
  const fragments = array(processDeclaration.commandIncludes, 'runtime.process.commandIncludes').map((item, index) =>
    string(item, `runtime.process.commandIncludes[${index}]`)
  )
  const processEntryId = string(processDeclaration.entry, 'runtime.process.entry')
  const processEntry = entries.find(item => item.id === processEntryId && item.kind === 'host')
  if (processEntry === undefined) {
    fail('RUNTIME_IDENTITY_MISMATCH', `runtime process entry is not a checked host entry: ${processEntryId}`)
  }
  const relativeEntry = path.relative(expectedCwd, processEntry.path)
  if (!fragments.includes(processEntry.path) && !fragments.includes(relativeEntry)) {
    fail('INVALID_MANIFEST', 'runtime.process.commandIncludes must include the absolute or cwd-relative host entry')
  }
  if (fragments.length === 0 || fragments.some(fragment => !observed.command.includes(fragment))) {
    fail('PROCESS_COMMAND_MISMATCH', `PID ${processDeclaration.pid} command did not contain every declared fragment`)
  }
  const http = object(source.http, 'runtime.http', ['url', 'status'])
  let url
  try {
    url = new URL(string(http.url, 'runtime.http.url'))
  } catch {
    fail('INVALID_MANIFEST', 'runtime.http.url must be an absolute URL')
  }
  if (url.protocol !== 'http:' || !loopbackHosts.has(url.hostname) || Number(url.port) !== source.expectedPort) {
    fail('INVALID_MANIFEST', 'runtime.http.url must use the declared loopback HTTP port')
  }
  if (!Number.isInteger(http.status) || http.status < 100 || http.status > 599) {
    fail('INVALID_MANIFEST', 'runtime.http.status must be an HTTP status integer')
  }
  let response
  try {
    response = await fetcher(url, { method: 'GET', signal: AbortSignal.timeout(3_000) })
  } catch (error) {
    fail('HTTP_NOT_READY', `${url.href}: ${error.message}`)
  }
  if (response.status !== http.status) {
    fail('HTTP_STATUS_MISMATCH', `${url.href} expected ${http.status} but received ${response.status}`)
  }
  return { state: source.state, expectedPort: source.expectedPort, httpReady: true, provenanceVerified: true }
}

export async function validateIntegrationAssembly(manifestPath, options = {}) {
  const started = performance.now()
  const absoluteManifest = path.resolve(manifestPath)
  try {
    let manifestRoot
    try {
      manifestRoot = path.dirname(await realpath(absoluteManifest))
    } catch {
      fail('MANIFEST_READ_FAILED', `manifest path does not exist: ${absoluteManifest}`)
    }
    let parsed
    try {
      parsed = JSON.parse(await readFile(absoluteManifest, 'utf8'))
    } catch (error) {
      fail('MANIFEST_READ_FAILED', `${absoluteManifest}: ${error.message}`)
    }
    const source = object(parsed, 'manifest', [
      'version',
      'repositories',
      'entries',
      'configuration',
      'selection',
      'runtime',
      'gates',
    ])
    if (source.version !== 1) fail('UNSUPPORTED_VERSION', 'manifest.version must be 1')
    const repositoryValues = []
    for (const [index, item] of array(source.repositories, 'repositories').entries()) {
      repositoryValues.push(await repository(item, index, manifestRoot))
    }
    const repositories = new Map()
    for (const item of repositoryValues) {
      if (repositories.has(item.id)) fail('INVALID_MANIFEST', `duplicate repository id: ${item.id}`)
      repositories.set(item.id, item)
    }
    if (repositories.size === 0) fail('INVALID_MANIFEST', 'repositories must not be empty')
    const entries = []
    for (const [index, item] of array(source.entries, 'entries').entries()) {
      entries.push(await entry(item, index, repositories))
    }
    if (entries.filter(item => item.kind === 'host').length !== 1) {
      fail('INVALID_MANIFEST', 'entries must declare exactly one host')
    }
    if (new Set(entries.map(item => item.id)).size !== entries.length) {
      fail('INVALID_MANIFEST', 'entry ids must be unique')
    }
    const configurationSource = object(source.configuration, 'configuration', [
      'requested',
      'stableHome',
      'effectiveSource',
      'bindings',
    ])
    const requested = configurationSource.requested === null
      ? null
      : await configReference(configurationSource.requested, 'configuration.requested', manifestRoot)
    const stableHome = configurationSource.stableHome === null
      ? null
      : await configReference(configurationSource.stableHome, 'configuration.stableHome', manifestRoot)
    if (!['requested', 'stable-home'].includes(configurationSource.effectiveSource)) {
      fail('INVALID_MANIFEST', 'configuration.effectiveSource must be requested or stable-home')
    }
    const effective = configurationSource.effectiveSource === 'requested' ? requested : stableHome
    if (effective === null) {
      fail('EFFECTIVE_CONFIG_MISMATCH', `effective ${configurationSource.effectiveSource} config is not declared`)
    }
    const configuration = {
      requested,
      stableHome,
      effectiveSource: configurationSource.effectiveSource,
      effective,
      manifestPath: absoluteManifest,
    }
    configuration.bindings = await configBindings(configurationSource.bindings, configuration, entries)
    const selection = object(source.selection, 'selection', ['lastGood', 'candidate', 'rollback'])
    const lastGood = revisionSet(selection.lastGood, 'selection.lastGood', repositories, false)
    const candidate = revisionSet(selection.candidate, 'selection.candidate', repositories, true)
    const rollback = object(selection.rollback, 'selection.rollback', ['mode', 'persistentFacts'])
    if (rollback.mode !== 'report-code-inputs-only' || rollback.persistentFacts !== 'preserve') {
      fail('INVALID_ROLLBACK_POLICY', 'rollback must report code inputs only and preserve persistent facts')
    }
    const gates = array(source.gates, 'gates').map((item, index) => {
      const label = `gates[${index}]`
      const gate = object(item, label, ['name', 'repository', 'sha', 'result', 'evidence'])
      const repositoryId = string(gate.repository, `${label}.repository`)
      const owner = repositories.get(repositoryId)
      if (owner === undefined) fail('INVALID_MANIFEST', `${label}.repository is unknown`)
      const sha = exactId(gate.sha, `${label}.sha`)
      if (sha !== owner.sha || gate.result !== 'pass') {
        fail('GATE_EVIDENCE_MISMATCH', `${label} must reference a passing checked-out SHA`)
      }
      return {
        name: string(gate.name, `${label}.name`),
        repository: repositoryId,
        sha,
        evidence: string(gate.evidence, `${label}.evidence`),
      }
    })
    if (gates.length === 0) fail('INVALID_MANIFEST', 'gates must not be empty')
    const runtimeResult = await runtime(
      source.runtime,
      repositories,
      entries,
      configuration,
      options.runtimeInspector ?? defaultRuntimeInspector(),
      options.fetch ?? globalThis.fetch,
    )
    return {
      status: 'PASS',
      version: 1,
      manifest: absoluteManifest,
      durationMs: Math.round((performance.now() - started) * 100) / 100,
      repositories: repositoryValues,
      entries,
      configuration: {
        requested: requested?.reference ?? null,
        stableHome: stableHome?.reference ?? null,
        effectiveSource: configuration.effectiveSource,
        effective: configuration.effective.reference,
        bindings: configuration.bindings,
      },
      selection: { lastGood, candidate, rollback },
      gates,
      runtime: runtimeResult,
    }
  } catch (error) {
    const blocker = error instanceof Blocker
      ? error
      : new Blocker('UNEXPECTED_ERROR', error instanceof Error ? error.message : String(error))
    return {
      status: 'FAIL',
      version: 1,
      manifest: absoluteManifest,
      durationMs: Math.round((performance.now() - started) * 100) / 100,
      blocker: { code: blocker.code, message: blocker.message },
    }
  }
}

async function main(argv) {
  if (argv.length !== 1) {
    process.stdout.write(`${
      JSON.stringify({
        status: 'FAIL',
        version: 1,
        blocker: { code: 'USAGE', message: 'usage: node scripts/check-integration-assembly.mjs <manifest.json>' },
      })
    }\n`)
    return 1
  }
  const result = await validateIntegrationAssembly(argv[0])
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
  return result.status === 'PASS' ? 0 : 1
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  process.exitCode = await main(process.argv.slice(2))
}
