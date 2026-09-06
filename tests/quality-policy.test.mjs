import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { after, before, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import tsParser from '@typescript-eslint/parser'
import { ESLint } from 'eslint'
import packageMetadata from '../package.json' with { type: 'json' }
import policy from '../tooling/quality/eslint-policy.mjs'

const require = createRequire(import.meta.url)
const execute = promisify(execFile)
const dprintEntry = require.resolve('dprint/bin.cjs')
let workspace

before(async () => {
  workspace = await realpath(await mkdtemp(path.join(tmpdir(), 'cordisx-quality-policy-')))
})

after(async () => {
  if (workspace) await rm(workspace, { recursive: true, force: true })
})

function linter() {
  return new ESLint({
    cwd: workspace,
    overrideConfigFile: true,
    overrideConfig: [
      { files: ['**/*.{js,mjs,cjs,jsx}'] },
      {
        files: ['**/*.{ts,mts,cts,tsx}'],
        languageOptions: { parser: tsParser },
      },
      policy,
    ],
  })
}

function sizeErrors(result) {
  return result.messages.filter(message => message.ruleId === 'max-lines' && message.severity === 2)
}

test('the effective owner configuration exposes its policy version and prevents inline overrides', async () => {
  const eslint = linter()
  for (const file of ['src/example.js', 'test/example.test.ts', 'src/view.tsx']) {
    const config = await eslint.calculateConfigForFile(file)
    assert.equal(await eslint.isPathIgnored(file), false)
    assert.equal(config.settings['cordisx/policyVersion'], packageMetadata.version)
    assert.equal(config.linterOptions.noInlineConfig, true)
  }
})

for (
  const [filePath, statement] of [
    ['src/example.js', 'void 0;\n'],
    ['test/example.test.ts', 'void (0 as number);\n'],
    ['src/view.tsx', 'void (<span />);\n'],
  ]
) {
  test(`${filePath}: 1000 lines pass and 1001 lines fail in standard ESLint`, async () => {
    const eslint = linter()
    const [atLimit] = await eslint.lintText(statement.repeat(1000), { filePath })
    const [overLimit] = await eslint.lintText(statement.repeat(1001), { filePath })
    assert.equal(atLimit.errorCount, 0)
    assert.equal(overLimit.fatalErrorCount, 0)
    assert.equal(sizeErrors(overLimit).length, 1)
  })
}

test('blank lines and comments remain part of the file limit', async () => {
  const source = 'void 0;\n'.repeat(500) + '// explanation\n'.repeat(300) + '\n'.repeat(201)
  const [result] = await linter().lintText(source, { filePath: 'src/comments.js' })
  assert.equal(sizeErrors(result).length, 1)
})

test('source comments cannot disable or raise the shared limit', async () => {
  for (
    const directive of [
      '/* eslint-disable max-lines */',
      '/* eslint max-lines: ["error", 2000] */',
    ]
  ) {
    const [result] = await linter().lintText(`${directive}\n${'void 0;\n'.repeat(1000)}`, {
      filePath: 'test/inline-config.test.js',
    })
    assert.equal(result.fatalErrorCount, 0)
    assert.equal(sizeErrors(result).length, 1)
  }
})

async function formattingProject(name, profile, overrides = {}) {
  const directory = path.join(workspace, name)
  await mkdir(path.join(directory, 'src'), { recursive: true })
  await mkdir(path.join(directory, 'ignored'), { recursive: true })
  const config = {
    extends: fileURLToPath(new URL(`../tooling/quality/dprint/${profile}.json`, import.meta.url)),
    includes: ['**/*.{js,ts,tsx,json,md}'],
    excludes: ['ignored/**', 'dprint.json'],
    ...overrides,
  }
  await writeFile(path.join(directory, 'dprint.json'), `${JSON.stringify(config, null, 2)}\n`)
  return directory
}

async function dprint(directory, ...args) {
  const result = await execute(process.execPath, [dprintEntry, ...args], {
    cwd: directory,
    timeout: 60_000,
    maxBuffer: 1024 * 1024,
    env: { ...process.env, DPRINT_MAX_THREADS: '2' },
  })
  return result.stdout
}

test('the code profile inherits common formatting and keeps module declaration order', async () => {
  const directory = await formattingProject('code', 'code')
  await writeFile(
    path.join(directory, 'src/example.ts'),
    [
      'import { z } from "./z";',
      'import { a } from "./a";',
      'export { y } from "./y";',
      'export { b } from "./b";',
      'const message="hello";',
    ].join('\r\n'),
  )
  await writeFile(path.join(directory, 'ignored/example.ts'), 'const untouched="yes";')

  const resolved = JSON.parse(await dprint(directory, 'resolved-config', '--file', 'src/example.ts'))
  assert.equal(resolved.typescript.indentWidth, 2)
  assert.equal(resolved.typescript.quoteStyle, 'preferSingle')
  assert.equal(resolved.typescript.semiColons, 'asi')
  assert.equal(resolved.typescript['module.sortImportDeclarations'], 'maintain')
  assert.equal(resolved.typescript['module.sortExportDeclarations'], 'maintain')

  await dprint(directory, 'fmt')
  await dprint(directory, 'check')
  const formatted = await readFile(path.join(directory, 'src/example.ts'), 'utf8')
  const parsed = tsParser.parse(formatted, { sourceType: 'module' })
  const modules = parsed.body.filter(node => node.source).map(node => node.source.value)
  assert.deepEqual(modules, ['./z', './a', './y', './b'])
  assert.match(formatted, /const message = 'hello'\n/u)
  assert.equal(formatted.includes('\r'), false)
  assert.equal(await readFile(path.join(directory, 'ignored/example.ts'), 'utf8'), 'const untouched="yes";')
})

test('owners can retain their JSX, semicolon and indentation conventions', async () => {
  const directory = await formattingProject('owner-overrides', 'code', {
    indentWidth: 4,
    typescript: { semiColons: 'always', 'jsx.quoteStyle': 'preferDouble' },
  })
  await writeFile(path.join(directory, 'src/example.tsx'), 'const view=<span title="hello" />;\n')
  const resolved = JSON.parse(await dprint(directory, 'resolved-config', '--file', 'src/example.tsx'))
  assert.equal(resolved.typescript.indentWidth, 4)
  assert.equal(resolved.typescript.semiColons, 'always')
  assert.equal(resolved.typescript['jsx.quoteStyle'], 'preferDouble')
  assert.equal(resolved.typescript['module.sortImportDeclarations'], 'maintain')
  await dprint(directory, 'fmt')
  assert.equal(
    await readFile(path.join(directory, 'src/example.tsx'), 'utf8'),
    'const view = <span title="hello" />;\n',
  )
})

test('the docs profile formats only supported local files and honors owner exclusions', async () => {
  const directory = await formattingProject('docs', 'docs')
  await writeFile(path.join(directory, 'README.md'), '# Example\n\n| a|b|\n|---|---|\n|1|2|\n')
  await writeFile(path.join(directory, 'src/example.json'), '{"value":1}\n')
  await writeFile(path.join(directory, 'src/example.ts'), 'const untouched="yes";')
  await writeFile(path.join(directory, 'ignored/example.json'), '{"untouched":true}')
  const listed = (await dprint(directory, 'file-paths')).trim().split(/\r?\n/u).map(file =>
    path.relative(directory, file)
  ).sort()
  assert.deepEqual(listed, ['README.md', path.join('src', 'example.json')].sort())
  const resolved = JSON.parse(await dprint(directory, 'resolved-config', '--file', 'README.md'))
  assert.equal(resolved.markdown.textWrap, 'maintain')
  await dprint(directory, 'fmt')
  await dprint(directory, 'check')
  assert.deepEqual(JSON.parse(await readFile(path.join(directory, 'src/example.json'), 'utf8')), { value: 1 })
  assert.equal(await readFile(path.join(directory, 'src/example.ts'), 'utf8'), 'const untouched="yes";')
  assert.equal(await readFile(path.join(directory, 'ignored/example.json'), 'utf8'), '{"untouched":true}')
})
