import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { install } from './install.mjs'
import { formatFiles, git } from './runtime.mjs'
import { materialize, treeEntries } from './snapshot.mjs'
import { publishRuntime } from './provider.mjs'

const provider = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const runner = join(provider, 'tooling/git-hooks/runner.mjs')
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'cordisx-hooks-test-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  writeFileSync(join(root, 'package.json'), '{}\n')
  git(root, ['init', '-q'])
  git(root, ['config', 'user.email', 'hooks@example.invalid'])
  git(root, ['config', 'user.name', 'Hooks Test'])
  writeFileSync(
    join(root, 'dprint.json'),
    JSON.stringify(
      {
        extends: join(provider, 'tooling/quality/dprint/code.json'),
        includes: ['**/*.{js,json}'],
        excludes: ['generated/**', 'node_modules/**'],
      },
      null,
      2,
    ) + '\n',
  )
  writeFileSync(join(root, 'a.js'), 'export const a = 1\n\nexport const b = 2\n')
  git(root, ['add', '.'])
  git(root, ['-c', 'core.hooksPath=/dev/null', 'commit', '-qm', 'baseline'])
  return root
}
function hook(root, mode, input = '') {
  return spawnSync(process.execPath, [runner, mode, provider, 'origin'], { cwd: root, input, encoding: 'utf8' })
}
const read = (root, file) => readFileSync(join(root, file), 'utf8')
const zero = '0'.repeat(40)
const pushLine = (root, base = zero) =>
  `refs/heads/main ${git(root, ['rev-parse', 'HEAD']).trim()} refs/heads/main ${base}\n`

test('partial staging, unstaged and untracked content survive formatting', (t) => {
  const root = fixture(t)
  writeFileSync(join(root, 'a.js'), 'export const a=3;\n\nexport const b = 2\n')
  git(root, ['add', 'a.js'])
  writeFileSync(join(root, 'a.js'), 'export const a=3;\n\nexport const b = 99\n')
  writeFileSync(join(root, 'untracked.js'), 'const   untouched=1;')
  const result = hook(root, 'pre-commit')
  assert.equal(result.status, 0, result.stderr + result.stdout)
  assert.equal(git(root, ['show', ':a.js']), 'export const a = 3\n\nexport const b = 2\n')
  assert.equal(read(root, 'a.js'), 'export const a = 3\n\nexport const b = 99\n')
  assert.equal(read(root, 'untracked.js'), 'const   untouched=1;')
})

test('literal special filenames and generated exclusions', (t) => {
  const root = fixture(t)
  const files = ['space file.js', "quote'file.js", 'double"file.js', '[glob]*.js', '-option.js', 'line\nbreak.js']
  for (const file of files) writeFileSync(join(root, file), 'const x=1;\n')
  mkdirSync(join(root, 'generated'))
  writeFileSync(join(root, 'generated/x.js'), 'const   x=1;\n')
  git(root, ['add', '.'])
  const result = hook(root, 'pre-commit')
  assert.equal(result.status, 0, result.stderr + result.stdout)
  for (const file of files) assert.equal(git(root, ['show', `:${file}`]), 'const x = 1\n')
  assert.equal(read(root, 'generated/x.js'), 'const   x=1;\n')
})

test('formatter failure preserves index and working tree', (t) => {
  const root = fixture(t)
  writeFileSync(join(root, 'a.js'), 'const good=1;\n')
  writeFileSync(join(root, 'bad.js'), 'const = ;\n')
  git(root, ['add', '.'])
  writeFileSync(join(root, 'a.js'), 'const good=1;\n// unstaged\n')
  const before = git(root, ['diff', '--binary'])
  const staged = git(root, ['diff', '--cached', '--binary'])
  assert.notEqual(hook(root, 'pre-commit').status, 0)
  assert.equal(git(root, ['diff', '--binary']), before)
  assert.equal(git(root, ['diff', '--cached', '--binary']), staged)
})

test('push checks committed tip, multiple refs and deletions without changing checkout', (t) => {
  const root = fixture(t)
  const base = git(root, ['rev-parse', 'HEAD']).trim()
  writeFileSync(join(root, 'a.js'), 'const bad=1;\n')
  git(root, ['add', 'a.js'])
  git(root, ['-c', 'core.hooksPath=/dev/null', 'commit', '-qm', 'unformatted'])
  const badLine = pushLine(root, base)
  writeFileSync(join(root, 'a.js'), 'const bad = 1\n')
  const before = git(root, ['status', '--porcelain=v1', '-z'])
  const failed = hook(root, 'pre-push', badLine)
  assert.notEqual(failed.status, 0, failed.stderr)
  assert.match(failed.stderr, /Unformatted committed files/)
  assert.equal(git(root, ['status', '--porcelain=v1', '-z']), before)
  git(root, ['add', 'a.js'])
  git(root, ['-c', 'core.hooksPath=/dev/null', 'commit', '-qm', 'formatted'])
  const goodLine = pushLine(root, base)
  assert.equal(hook(root, 'pre-push', goodLine).status, 0)
  assert.notEqual(hook(root, 'pre-push', goodLine + badLine).status, 0)
  assert.equal(hook(root, 'pre-push', `refs/heads/gone ${zero} refs/heads/gone ${base}\n`).status, 0)
})

test('installer audits without mutation and preserves custom hooks and hooksPath', (t) => {
  const root = fixture(t)
  const hooks = join(root, '.git/hooks')
  writeFileSync(join(hooks, 'pre-commit'), '#!/bin/sh\necho custom\n')
  const result = install({ root, provider })
  assert.equal(result.repositories[0].state, 'conflict')
  assert.equal(read(root, '.git/hooks/pre-commit'), '#!/bin/sh\necho custom\n')
  git(root, ['config', 'core.hooksPath', '.custom'])
  assert.match(install({ root, provider }).repositories[0].reason, /hooksPath/)
  git(root, ['config', 'core.hooksPath', ''])
  assert.match(install({ root, provider }).repositories[0].reason, /hooksPath/)
  git(root, ['config', '--unset', 'core.hooksPath'])
  rmSync(join(hooks, 'pre-commit'))
  symlinkSync('/nonexistent/custom-hook', join(hooks, 'pre-commit'))
  assert.equal(install({ root, provider }).repositories[0].state, 'conflict')
})

test('durable provider installs shared runtime, including standalone clones', (t) => {
  const root = fixture(t)
  const durable = fixture(t)
  symlinkSync(join(provider, 'node_modules'), join(durable, 'node_modules'), 'dir')
  cpSync(join(provider, 'tooling'), join(durable, 'tooling'), { recursive: true })
  const result = install({ root, provider: durable, apply: true })
  assert.equal(result.repositories[0].state, 'installed')
  assert.ok(existsSync(join(durable, '.git/cordisx-format-hooks-v1/runner.mjs')))
  writeFileSync(join(root, 'a.js'), 'const x=1;\n')
  git(root, ['add', 'a.js'])
  git(root, ['commit', '-qm', 'hook actually ran'])
  assert.equal(git(root, ['show', 'HEAD:a.js']), 'const x = 1\n')
})

test('new ref uses existing remote baseline and checks final tip only', (t) => {
  const root = fixture(t)
  const base = git(root, ['rev-parse', 'HEAD']).trim()
  git(root, ['remote', 'add', 'origin', 'https://example.invalid/repo.git'])
  git(root, ['update-ref', 'refs/remotes/origin/main', base])
  writeFileSync(join(root, 'new\nfile.js'), 'const x=1;\n')
  git(root, ['add', '.'])
  git(root, ['-c', 'core.hooksPath=/dev/null', 'commit', '-qm', 'bad'])
  assert.notEqual(hook(root, 'pre-push', pushLine(root)).status, 0)
  writeFileSync(join(root, 'new\nfile.js'), 'const x = 1\n')
  git(root, ['add', '.'])
  git(root, ['-c', 'core.hooksPath=/dev/null', 'commit', '-qm', 'fixed'])
  const result = hook(root, 'pre-push', pushLine(root))
  assert.equal(result.status, 0, result.stderr)
})

test('push snapshots ignore export attributes and preserve committed exclusions', (t) => {
  const root = fixture(t)
  const base = git(root, ['rev-parse', 'HEAD']).trim()
  writeFileSync(join(root, '.gitattributes'), 'a.js export-ignore\n')
  writeFileSync(join(root, 'a.js'), 'const x=1;\n')
  git(root, ['add', '.'])
  git(root, ['-c', 'core.hooksPath=/dev/null', 'commit', '-qm', 'ignored in archive'])
  assert.notEqual(hook(root, 'pre-push', pushLine(root, base)).status, 0)
})

test('installer skips private before inspecting checkout, and uninstall removes only managed wrappers', (t) => {
  const root = fixture(t)
  const durable = fixture(t)
  symlinkSync(join(provider, 'node_modules'), join(durable, 'node_modules'), 'dir')
  writeFileSync(
    join(root, '.gitmodules'),
    '[submodule "private"]\npath = private\nupdate = none\n[submodule "public"]\npath = absent\n',
  )
  const result = install({ root, provider: durable, apply: true })
  assert.deepEqual(result.repositories.map(({ state }) => state), [
    'installed',
    'skipped-private',
    'skipped-uninitialized',
  ])
  install({ root, provider: durable, apply: true, uninstall: true })
  assert.equal(existsSync(join(root, '.git/hooks/pre-commit')), false)
  assert.equal(existsSync(join(root, '.git/hooks/pre-push')), false)
  assert.ok(existsSync(join(root, '.git/hooks/pre-commit.sample')))
})

test('installed dependencies and runtime survive deleting the provider worktree', (t) => {
  const root = fixture(t)
  const main = fixture(t)
  const linked = join(main, 'linked')
  git(main, ['worktree', 'add', '--detach', linked, 'HEAD'])
  symlinkSync(join(provider, 'node_modules'), join(linked, 'node_modules'), 'dir')
  install({ root, provider: linked, apply: true })
  git(main, ['worktree', 'remove', '--force', linked])
  writeFileSync(join(root, 'a.js'), 'const survives=1;\n')
  git(root, ['add', 'a.js'])
  git(root, ['commit', '-qm', 'survives provider source deletion'])
  assert.equal(git(root, ['show', 'HEAD:a.js']), 'const survives = 1\n')
})

test('unsupported binary stages and pushes without decoding or formatting it', (t) => {
  const root = fixture(t)
  const base = git(root, ['rev-parse', 'HEAD']).trim()
  const binary = Buffer.from([137, 80, 78, 71, 0, 255, 254])
  writeFileSync(join(root, 'image.png'), binary)
  writeFileSync(join(root, 'unhandled.data'), binary)
  git(root, ['add', '.'])
  const result = hook(root, 'pre-commit')
  assert.equal(result.status, 0, result.stderr + result.stdout)
  assert.deepEqual(readFileSync(join(root, 'image.png')), binary)
  git(root, ['-c', 'core.hooksPath=/dev/null', 'commit', '-qm', 'binary'])
  const pushed = hook(root, 'pre-push', pushLine(root, base))
  assert.equal(pushed.status, 0, pushed.stderr)
})

test('snapshot never reads unmodified assets or unsupported changed blobs', (t) => {
  const root = fixture(t)
  const snapshot = mkdtempSync(join(tmpdir(), 'cordisx-snapshot-test-'))
  t.after(() => rmSync(snapshot, { recursive: true, force: true }))
  const entries = treeEntries(root, 'HEAD')
  entries.push({ mode: '100644', type: 'blob', oid: 'not-read-large-video', path: 'large-video.mp4' })
  entries.push({ mode: '100644', type: 'blob', oid: 'not-read-png', path: 'changed.png' })
  const reads = []
  const selected = materialize(root, provider, 'HEAD', snapshot, ['a.js', 'changed.png'], {
    entries,
    readBlob(entry) {
      assert.ok(!entry.oid.startsWith('not-read'), 'large/unsupported blob must not be read')
      reads.push(entry.path)
      return Buffer.from(git(root, ['cat-file', 'blob', entry.oid]))
    },
  })
  assert.deepEqual(selected, ['a.js'])
  assert.deepEqual(reads.sort(), ['a.js', 'dprint.json'])
  assert.equal(existsSync(join(snapshot, 'large-video.mp4')), false)
})

test('committed local extends controls changed files without broadening to old debt', (t) => {
  const root = fixture(t)
  const base = git(root, ['rev-parse', 'HEAD']).trim()
  writeFileSync(
    join(root, 'local.json'),
    JSON.stringify(
      {
        extends: join(provider, 'tooling/quality/dprint/code.json'),
        typescript: { semiColons: 'always' },
      },
      null,
      2,
    ) + '\n',
  )
  writeFileSync(
    join(root, 'dprint.json'),
    JSON.stringify(
      {
        extends: './local.json',
        includes: ['**/*.js'],
        excludes: ['node_modules/**'],
      },
      null,
      2,
    ) + '\n',
  )
  writeFileSync(join(root, 'changed.js'), 'const x = 1;\n')
  git(root, ['add', '.'])
  git(root, ['-c', 'core.hooksPath=/dev/null', 'commit', '-qm', 'new policy'])
  // The old a.js lacks semicolons but is outside this push's changed-file scope.
  const passed = hook(root, 'pre-push', pushLine(root, base))
  assert.equal(passed.status, 0, passed.stderr)
  writeFileSync(join(root, 'changed.js'), 'const x = 1\n')
  git(root, ['add', '.'])
  git(root, ['-c', 'core.hooksPath=/dev/null', 'commit', '-qm', 'violates committed extends'])
  assert.notEqual(hook(root, 'pre-push', pushLine(root, base)).status, 0)
})

test('Git symlinks stay untouched and parent symlinks cannot escape the repository', (t) => {
  const root = fixture(t)
  const outside = fixture(t)
  const base = git(root, ['rev-parse', 'HEAD']).trim()
  writeFileSync(join(outside, 'target.js'), 'const outside=1;\n')
  symlinkSync(join(outside, 'target.js'), join(root, 'link.js'))
  git(root, ['add', 'link.js'])
  const result = hook(root, 'pre-commit')
  assert.equal(result.status, 0, result.stderr + result.stdout)
  git(root, ['-c', 'core.hooksPath=/dev/null', 'commit', '-qm', 'symlink'])
  assert.equal(hook(root, 'pre-push', pushLine(root, base)).status, 0)
  symlinkSync(outside, join(root, 'escape'), 'dir')
  assert.throws(() => formatFiles(root, provider, ['escape/target.js']), /Symlink escapes/)
  assert.equal(read(outside, 'target.js'), 'const outside=1;\n')
})

test('repeat installation reuses complete dependencies and safely publishes updates', (t) => {
  const root = fixture(t)
  const durable = fixture(t)
  symlinkSync(join(provider, 'node_modules'), join(durable, 'node_modules'), 'dir')
  writeFileSync(join(durable, 'package-lock.json'), '{"lockfileVersion":3,"packages":{}}\n')
  const first = install({ root, provider: durable, apply: true })
  const dependencies = join(first.runtime, 'dependencies')
  assert.equal(install({ root, provider: durable }).repositories[0].installed, true)
  const originalDependencies = readdirSync(dependencies)
  const originalRunner = readFileSync(join(first.runtime, 'runner.mjs'), 'utf8')
  assert.equal(originalDependencies.length, 1)
  install({ root, provider: durable, apply: true })
  assert.deepEqual(readdirSync(dependencies), originalDependencies)
  assert.equal(readFileSync(join(first.runtime, 'runner.mjs'), 'utf8'), originalRunner)

  const updatedSource = join(durable, 'updated-source')
  cpSync(join(provider, 'tooling/git-hooks'), updatedSource, { recursive: true })
  writeFileSync(
    join(updatedSource, 'runner.mjs'),
    readFileSync(join(updatedSource, 'runner.mjs'), 'utf8') + '\n// update fixture\n',
  )
  publishRuntime(first.runtime, durable, updatedSource)
  assert.deepEqual(readdirSync(dependencies), originalDependencies, 'code update must reuse dependencies')
  assert.notEqual(readFileSync(join(first.runtime, 'runner.mjs'), 'utf8'), originalRunner)

  writeFileSync(join(durable, 'package-lock.json'), '{"lockfileVersion":3,"packages":{},"version":"updated"}\n')
  install({ root, provider: durable, apply: true })
  assert.equal(readdirSync(dependencies).length, 2)
  assert.ok(existsSync(join(dependencies, originalDependencies[0], 'READY')), 'previous snapshot retained')
  const activated = readFileSync(join(first.runtime, 'runner.mjs'), 'utf8')
  assert.throws(() => publishRuntime(first.runtime, durable, join(durable, 'missing-source')))
  assert.equal(readFileSync(join(first.runtime, 'runner.mjs'), 'utf8'), activated, 'failed update keeps activation')
  assert.ok(!readdirSync(first.runtime).some((name) => name.startsWith('.activation-')))
  writeFileSync(join(root, 'a.js'), 'const afterUpdate=1;\n')
  git(root, ['add', 'a.js'])
  git(root, ['commit', '-qm', 'updated hook ran'])
  assert.equal(git(root, ['show', 'HEAD:a.js']), 'const afterUpdate = 1\n')
})
