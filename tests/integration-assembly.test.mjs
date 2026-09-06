import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, readFile, realpath, rm, symlink, writeFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { validateIntegrationAssembly } from '../scripts/check-integration-assembly.mjs'

const execute = promisify(execFile)
const workspaces = new Set()

afterEach(async () => {
  await Promise.all([...workspaces].map(workspace => rm(workspace, { recursive: true, force: true })))
  workspaces.clear()
})

async function command(cwd, executable, ...args) {
  const { stdout } = await execute(executable, args, { cwd, encoding: 'utf8' })
  return stdout.trim()
}

async function repository(root, name, entry) {
  const checkout = path.join(root, name)
  await mkdir(path.dirname(path.join(checkout, entry)), { recursive: true })
  await command(checkout, 'git', 'init', '--quiet', '--initial-branch=main')
  await command(checkout, 'git', 'config', 'user.email', 'fixture@example.invalid')
  await command(checkout, 'git', 'config', 'user.name', 'Fixture')
  await writeFile(path.join(checkout, entry), `export const identity = '${name}'\n`)
  await command(checkout, 'git', 'add', '.')
  await command(checkout, 'git', 'commit', '--quiet', '-m', `create ${name}`)
  return {
    checkout: await realpath(checkout),
    entry,
    sha: await command(checkout, 'git', 'rev-parse', 'HEAD'),
    tree: await command(checkout, 'git', 'rev-parse', 'HEAD^{tree}'),
  }
}

async function digest(file) {
  return createHash('sha256').update(await readFile(file)).digest('hex')
}

async function unusedPort() {
  const server = createServer()
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  const address = server.address()
  assert(address && typeof address === 'object')
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
  return address.port
}

async function fixture() {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), 'cordisx-integration-assembly-')))
  workspaces.add(root)
  const host = await repository(root, 'host', 'dist/host.js')
  const consumer = await repository(root, 'consumer', 'dist/consumer.js')
  const requested = path.join(root, 'requested.json')
  const stableHome = path.join(root, 'stable-home.json')
  const effectiveDocument = {
    plugins: [{ entry: path.relative(root, path.join(consumer.checkout, consumer.entry)) }],
    permission: { identity: 'fixture-local-development' },
  }
  await writeFile(requested, `${JSON.stringify(effectiveDocument)}\n`)
  await writeFile(stableHome, `${JSON.stringify(effectiveDocument)}\n`)
  const manifestPath = path.join(root, 'assembly.json')
  const repositories = { host, consumer }
  const manifest = {
    version: 1,
    repositories: Object.entries(repositories).map(([id, item]) => ({
      id,
      checkout: item.checkout,
      sha: item.sha,
      tree: item.tree,
      dirty: { state: 'clean' },
    })),
    entries: [
      {
        id: 'host-cli',
        kind: 'host',
        repository: 'host',
        path: host.entry,
        sha256: await digest(path.join(host.checkout, host.entry)),
      },
      {
        id: 'consumer-runtime',
        kind: 'consumer',
        repository: 'consumer',
        path: consumer.entry,
        sha256: await digest(path.join(consumer.checkout, consumer.entry)),
      },
    ],
    configuration: {
      requested: { path: requested, sha256: await digest(requested) },
      stableHome: { path: stableHome, sha256: await digest(stableHome) },
      effectiveSource: 'stable-home',
      bindings: [
        {
          id: 'consumer-entry',
          source: 'effective',
          pointer: '/plugins/0/entry',
          kind: 'entry',
          entry: 'consumer-runtime',
        },
        {
          id: 'permission-identity',
          source: 'effective',
          pointer: '/permission/identity',
          kind: 'literal',
          value: 'fixture-local-development',
        },
      ],
    },
    selection: {
      lastGood: {
        id: 'last-good',
        repositories: { host: host.sha, consumer: consumer.sha },
      },
      candidate: {
        id: 'candidate',
        repositories: { host: host.sha, consumer: consumer.sha },
      },
      rollback: { mode: 'report-code-inputs-only', persistentFacts: 'preserve' },
    },
    runtime: {
      state: 'running',
      expectedPort: 45123,
      process: {
        pid: 32123,
        owner: 'fixture',
        cwd: host.checkout,
        entry: 'host-cli',
        commandIncludes: ['node', 'dist/host.js'],
      },
      http: { url: 'http://127.0.0.1:45123/ready', status: 200 },
      identity: {
        hostRepository: 'host',
        consumerRepositories: ['consumer'],
        permissionBinding: 'permission-identity',
      },
    },
    gates: Object.entries(repositories).map(([id, item]) => ({
      name: `${id}-check`,
      repository: id,
      sha: item.sha,
      result: 'pass',
      evidence: `fixture://${id}/check`,
    })),
  }
  const observedProcess = {
    owner: 'fixture',
    cwd: host.checkout,
    command: `node ${path.join(host.checkout, 'dist/host.js')}`,
  }
  const runtimeInspector = {
    listenerPids: async () => [32123],
    process: async () => observedProcess,
  }
  const fetcher = async () => ({ status: 200 })

  async function validate(next = manifest, options = {}) {
    await writeFile(manifestPath, `${JSON.stringify(next, null, 2)}\n`)
    return validateIntegrationAssembly(manifestPath, {
      runtimeInspector: options.runtimeInspector ?? runtimeInspector,
      fetch: options.fetch ?? fetcher,
    })
  }

  return { root, host, consumer, manifest, manifestPath, observedProcess, runtimeInspector, fetcher, validate }
}

async function expectBlocker(result, code) {
  assert.equal(result.status, 'FAIL')
  assert.equal(result.blocker.code, code)
  assert.equal(Object.hasOwn(result, 'repositories'), false)
}

test('rejects an uninitialized mount that would otherwise fall through to its parent repository', async () => {
  const value = await fixture()
  const nested = path.join(value.host.checkout, 'uninitialized')
  await mkdir(nested)
  const manifest = structuredClone(value.manifest)
  manifest.repositories[0].checkout = nested
  await expectBlocker(await value.validate(manifest), 'REPOSITORY_ROOT_MISMATCH')
})

test('rejects a repository HEAD mismatch', async () => {
  const value = await fixture()
  const manifest = structuredClone(value.manifest)
  manifest.repositories[0].sha = value.consumer.sha
  await expectBlocker(await value.validate(manifest), 'SHA_MISMATCH')
})

test('rejects a repository tree mismatch independently of HEAD', async () => {
  const value = await fixture()
  const manifest = structuredClone(value.manifest)
  manifest.repositories[0].tree = value.consumer.tree
  await expectBlocker(await value.validate(manifest), 'TREE_MISMATCH')
})

test('rejects dirty files that were not declared', async () => {
  const value = await fixture()
  await writeFile(path.join(value.host.checkout, 'untracked.txt'), 'dirty\n')
  await expectBlocker(await value.validate(), 'UNDECLARED_DIRTY_TREE')
})

test('rejects an entry whose real path changes repository identity', async () => {
  const value = await fixture()
  const external = path.join(value.root, 'external.js')
  await writeFile(external, 'export {}\n')
  const link = path.join(value.host.checkout, 'dist/escaped.js')
  await symlink(external, link)
  const manifest = structuredClone(value.manifest)
  manifest.repositories[0].dirty = { state: 'declared', reason: 'fixture symlink', paths: ['dist/escaped.js'] }
  manifest.entries[0].path = 'dist/escaped.js'
  await expectBlocker(await value.validate(manifest), 'ENTRY_IDENTITY_MISMATCH')
})

test('rejects a permission identity binding that does not validate the effective config', async () => {
  const value = await fixture()
  const manifest = structuredClone(value.manifest)
  manifest.configuration.bindings[1].source = 'stable-home'
  await expectBlocker(await value.validate(manifest), 'EFFECTIVE_CONFIG_MISMATCH')
})

test('rejects a hashed stable-home config that still points to an old consumer entry', async () => {
  const value = await fixture()
  const oldEntry = path.join(value.root, 'old-consumer/dist/consumer.js')
  await mkdir(path.dirname(oldEntry), { recursive: true })
  await writeFile(oldEntry, "export const identity = 'old-consumer'\n")
  const stableDocument = {
    plugins: [{ entry: path.relative(value.root, oldEntry) }],
    permission: { identity: 'fixture-local-development' },
  }
  await writeFile(value.manifest.configuration.stableHome.path, `${JSON.stringify(stableDocument)}\n`)
  const manifest = structuredClone(value.manifest)
  manifest.configuration.stableHome.sha256 = await digest(value.manifest.configuration.stableHome.path)
  await expectBlocker(await value.validate(manifest), 'EFFECTIVE_CONFIG_ENTRY_MISMATCH')
})

test('rejects a listener owned by the wrong process', async () => {
  const value = await fixture()
  const runtimeInspector = { ...value.runtimeInspector, listenerPids: async () => [32124] }
  await expectBlocker(await value.validate(value.manifest, { runtimeInspector }), 'PORT_PROCESS_MISMATCH')
})

test('rejects HTTP 200 when process provenance points at the wrong Host checkout', async () => {
  const value = await fixture()
  const runtimeInspector = {
    ...value.runtimeInspector,
    process: async () => ({ ...value.observedProcess, cwd: value.consumer.checkout }),
  }
  await expectBlocker(await value.validate(value.manifest, { runtimeInspector }), 'PROCESS_CWD_MISMATCH')
})

test('passes one fully matching running assembly and reports effective provenance', async () => {
  const value = await fixture()
  const result = await value.validate()
  assert.equal(result.status, 'PASS')
  assert.equal(result.version, 1)
  assert.equal(result.configuration.effectiveSource, 'stable-home')
  assert.equal(result.configuration.effective.path, await realpath(value.manifest.configuration.stableHome.path))
  assert.equal(result.configuration.bindings[1].verified, true)
  assert.equal(Object.hasOwn(result.configuration.bindings[1], 'value'), false)
  assert.deepEqual(result.runtime, {
    state: 'running',
    expectedPort: 45123,
    httpReady: true,
    provenanceVerified: true,
  })
  assert.deepEqual(result.selection.rollback, {
    mode: 'report-code-inputs-only',
    persistentFacts: 'preserve',
  })
})

test('the CLI emits one machine-readable PASS document without changing the fixture', async () => {
  const value = await fixture()
  const manifest = structuredClone(value.manifest)
  manifest.runtime.state = 'not-running'
  manifest.runtime.expectedPort = await unusedPort()
  manifest.runtime.process = null
  manifest.runtime.http = null
  await writeFile(value.manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  const before = await digest(value.manifestPath)
  const script = fileURLToPath(new URL('../scripts/check-integration-assembly.mjs', import.meta.url))
  const { stdout } = await execute(process.execPath, [script, value.manifestPath], { encoding: 'utf8' })
  const result = JSON.parse(stdout)
  assert.equal(result.status, 'PASS')
  assert.equal(result.runtime.state, 'not-running')
  assert.equal(await digest(value.manifestPath), before)
})
