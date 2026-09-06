import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { auditQuality } from '../scripts/check-quality.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const packageMetadata = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))
const reference = '1'.repeat(40)
const otherReference = '2'.repeat(40)

function fixture(t, options = {}) {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'cordisx-quality-consumption-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  const write = (file, value) => {
    const target = path.join(directory, file)
    mkdirSync(path.dirname(target), { recursive: true })
    writeFileSync(target, value)
  }
  symlinkSync(path.join(root, 'node_modules'), path.join(directory, 'node_modules'), 'dir')
  mkdirSync(path.join(directory, 'tooling'), { recursive: true })
  symlinkSync(path.join(root, 'tooling/quality'), path.join(directory, 'tooling/quality'), 'dir')
  write('.gitignore', 'node_modules/\ntooling/\n')
  write(
    'package.json',
    JSON.stringify(
      {
        name: packageMetadata.name,
        version: packageMetadata.version,
        private: true,
        type: 'module',
      },
      null,
      2,
    ),
  )
  write('README.md', '# Controlled quality fixture\n')
  const typed = options.profile === 'typescript'
  const source = typed ? 'src/example.ts' : 'src/example.js'
  if (!options.formatOnly) {
    write(source, typed ? 'export const value: number = 1\n' : 'export const value = 1\n')
    write('test/example.test.js', 'export const expected = 1\n')
  }
  const config = extra =>
    `import shared from './tooling/quality/eslint-policy.mjs'
${typed ? "import parser from '@typescript-eslint/parser'" : ''}
export default [
  { ignores: ${JSON.stringify(options.ignores ?? [])} },
  { ...shared, files: ['**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}']${typed ? ', languageOptions: { parser }' : ''} },
  ${extra ?? ''}
]
`
  if (!options.formatOnly) write('eslint.config.mjs', config(options.override))
  const formatter = {
    extends: `./tooling/quality/dprint/${options.formatOnly ? 'docs' : 'code'}.json`,
    includes: options.formatIncludes ?? ['src/**/*.{js,ts}', 'test/**/*.js', '*.md'],
    excludes: [],
  }
  write('dprint.json', `// Fixture intentionally exercises JSONC.\n${JSON.stringify(formatter, null, 2)}\n`)
  execFileSync('git', ['init', '--quiet', directory])
  const track = () => execFileSync('git', ['-C', directory, 'add', '.'])
  track()
  return {
    directory,
    source,
    write,
    config,
    formatter,
    track,
    options: {
      repo: directory,
      policyRoot: directory,
      policyRef: reference,
      profile: options.formatOnly ? 'format-only' : options.profile ?? 'javascript',
      provider: true,
    },
  }
}

test('provider inspection uses standard tools without claiming full source lint or format success', async t => {
  const f = fixture(t)
  // Existing source debt is intentionally not linted by this configuration audit.
  f.write(f.source, Array(1005).fill('void 0;').join('\n'))
  f.track()
  const result = await auditQuality(f.options)
  assert.equal(result.ok, true, result.errors.join('\n'))
  assert.match(result.scope, /not a full source lint/u)
  assert.ok(result.eslint.probes.some(probe => probe.inlineDisable && probe.maxLinesError))
  assert.ok(result.eslint.covered.some(file => file.role === 'source'))
  assert.ok(result.eslint.covered.some(file => file.role === 'test'))
  assert.ok(result.dprint.covered.includes(f.source))
})

test('TypeScript profile probes the owner installed parser with TypeScript syntax', async t => {
  const f = fixture(t, { profile: 'typescript' })
  const result = await auditQuality(f.options)
  assert.equal(result.ok, true, result.errors.join('\n'))
  assert.ok(result.eslint.probes.some(probe => probe.language === 'typescript' && probe.maxLinesError))
})

test('mixed JSX and TSX configurations each receive their own syntax/enforcement probe', async t => {
  const f = fixture(t)
  f.write('src/first.jsx', 'export const first = <span />\n')
  f.write('src/second.tsx', 'export const second: unknown = <span />\n')
  f.write('eslint.config.mjs', f.config('{ languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } } },'))
  f.write(
    'dprint.json',
    JSON.stringify({ ...f.formatter, includes: ['src/**/*.{js,jsx,tsx}', 'test/**/*.js', '*.md'] }),
  )
  f.track()
  const result = await auditQuality({ ...f.options, profile: 'typescript' })
  assert.equal(result.ok, false)
  assert.ok(result.eslint.probes.some(probe => probe.language === 'jsx' && probe.maxLinesError))
  assert.ok(result.eslint.probes.some(probe => probe.language === 'tsx' && probe.fatal.length))
  assert.match(result.errors.join('\n'), /second\.tsx: standard ESLint synthetic enforcement probe failed/u)
})

test('a documentation provider can use format-only with no fake source lint job', async t => {
  const f = fixture(t, { formatOnly: true })
  const result = await auditQuality(f.options)
  assert.equal(result.ok, true, result.errors.join('\n'))
  assert.equal(result.eslint, undefined)
  assert.ok(result.dprint.covered.includes('README.md'))
})

test('missing shared package and remote formatter references fail before consumer tool execution', async t => {
  const f = fixture(t)
  const result = await auditQuality({ ...f.options, provider: false })
  assert.equal(result.ok, false)
  assert.match(result.errors.join('\n'), /devDependency must pin/u)
  assert.match(result.errors.join('\n'), /dprint extends must consume/u)
  assert.equal(result.eslint, undefined)
})

test('a wrong lock SHA is rejected even when manifest and dprint pin the requested SHA', async t => {
  const f = fixture(t)
  const dependency = `github:cordisx/cordisxmono#${reference}`
  f.write(
    'package.json',
    JSON.stringify({
      name: 'fixture-consumer',
      private: true,
      devDependencies: { '@cordisx/eslint-config': dependency },
    }),
  )
  // Keep the expected provider metadata in the real policy root for consumer reference checks.
  f.write(
    'package-lock.json',
    JSON.stringify({
      lockfileVersion: 3,
      packages: {
        '': { devDependencies: { '@cordisx/eslint-config': dependency } },
        'node_modules/@cordisx/eslint-config': {
          resolved: `git+https://github.com/cordisx/cordisxmono.git#${otherReference}`,
        },
      },
    }),
  )
  f.write(
    'dprint.json',
    JSON.stringify({
      ...f.formatter,
      extends: `https://raw.githubusercontent.com/cordisx/cordisxmono/${reference}/tooling/quality/dprint/code.json`,
    }),
  )
  const result = await auditQuality({ ...f.options, provider: false, policyRoot: root })
  assert.equal(result.ok, false)
  assert.match(result.errors.join('\n'), /lock resolved URL/u)
  assert.equal(result.eslint, undefined)
})

test('overriding the shared core rule is rejected by calculated configuration', async t => {
  const f = fixture(t, { override: "{ rules: { 'max-lines': 'off' } }," })
  const result = await auditQuality(f.options)
  assert.equal(result.ok, false)
  assert.match(result.errors.join('\n'), /effective shared policy differs \(rule max-lines\)/u)
})

test('allowing inline overrides or changing the shared version marker is rejected', async t => {
  const f = fixture(t, {
    override: "{ linterOptions: { noInlineConfig: false }, settings: { 'cordisx/policyVersion': 'obsolete' } },",
  })
  f.write(f.source, '/* eslint-disable max-lines */\nexport const value = 1\n')
  f.track()
  const result = await auditQuality(f.options)
  assert.equal(result.ok, false)
  assert.match(result.errors.join('\n'), /noInlineConfig/u)
  assert.match(result.errors.join('\n'), /setting cordisx\/policyVersion/u)
})

test('ignored files are not passed files and ignoring every test fails', async t => {
  const f = fixture(t, { ignores: ['test/**'] })
  const result = await auditQuality(f.options)
  assert.equal(result.ok, false)
  assert.match(result.errors.join('\n'), /ESLint ignores every tracked test/u)
  assert.ok(result.eslint.ignored.some(file => file.path === 'test/example.test.js'))
  assert.ok(!result.eslint.covered.some(file => file.path === 'test/example.test.js'))
})

test('linting only the bootstrap config and tests is not source coverage', async t => {
  const f = fixture(t, { ignores: ['src/**'] })
  const result = await auditQuality(f.options)
  assert.equal(result.ok, false)
  assert.match(result.errors.join('\n'), /ESLint covers no tracked source/u)
})

test('formatter configuration loads but an empty actual file range fails', async t => {
  const f = fixture(t, { formatIncludes: ['missing/**/*.js'] })
  const result = await auditQuality(f.options)
  assert.equal(result.ok, false)
  assert.match(result.errors.join('\n'), /dprint covers no tracked source\/document/u)
  assert.equal(result.dprint.covered.length, 0)
})

test('a format-only label cannot hide tracked business or governance JavaScript', async t => {
  const f = fixture(t, { formatOnly: true })
  f.write('scripts/governance.mjs', 'export const enabled = true\n')
  f.track()
  const result = await auditQuality(f.options)
  assert.equal(result.ok, false)
  assert.match(result.errors.join('\n'), /format-only profile contains tracked JS\/TS/u)
})

test('CLI emits JSON without running a full lint or changing owner files', t => {
  const f = fixture(t, { formatOnly: true })
  const stdout = execFileSync(process.execPath, [
    path.join(root, 'scripts/check-quality.mjs'),
    '--repo',
    f.directory,
    '--profile',
    'format-only',
    '--policy-root',
    f.directory,
    '--policy-ref',
    reference,
    '--provider',
    '--json',
  ], { encoding: 'utf8' })
  const report = JSON.parse(stdout)
  assert.equal(report.ok, true)
  assert.match(report.scope, /not a full source lint/u)
})
