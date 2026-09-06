#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { existsSync, lstatSync, readFileSync, realpathSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { isDeepStrictEqual } from 'node:util'
import { pathToFileURL } from 'node:url'
import { parse, printParseErrorCode } from 'jsonc-parser'

const packageName = '@cordisx/eslint-config'
const profiles = new Set(['javascript', 'typescript', 'next', 'format-only'])
const codePattern = '**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}'
const codeExtension = /\.(?:[cm]?[jt]s|[jt]sx)$/u
const typedExtension = /\.(?:[cm]?ts|tsx)$/u
const versionKey = 'cordisx/policyVersion'

function json(file) {
  const errors = []
  const value = parse(readFileSync(file, 'utf8'), errors, { allowTrailingComma: true })
  if (errors.length) {
    throw new Error(`${file}: ${errors.map(error => printParseErrorCode(error.error)).join(', ')}`)
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${file}: expected an object`)
  return value
}

function trackedFiles(repo) {
  const output = execFileSync('git', ['-C', repo, 'ls-files', '--stage', '-z'], { encoding: 'utf8' })
  const files = []
  const skipped = []
  for (const record of output.split('\0').filter(Boolean)) {
    const tab = record.indexOf('\t')
    const [mode, , stage] = record.slice(0, tab).split(' ')
    const file = record.slice(tab + 1)
    if (stage !== '0') throw new Error(`Unresolved Git entry: ${file}`)
    if (mode === '160000' || mode === '120000') {
      skipped.push({ path: file, reason: mode === '160000' ? 'submodule' : 'symlink' })
      continue
    }
    if (!lstatSync(path.join(repo, file)).isFile()) continue
    files.push(file)
  }
  return { files, skipped }
}

function role(file) {
  if (!codeExtension.test(file)) return /\.(?:md|markdown)$/u.test(file) ? 'document' : 'other'
  if (/^eslint\.config\./u.test(path.basename(file))) return 'configuration'
  if (/(?:^|\/)(?:test|tests|__tests__|conformance)(?:\/|$)|\.(?:test|spec)\./u.test(file)) return 'test'
  return 'source'
}

function gitReference(value, ref, resolved = false) {
  if (typeof value !== 'string') return false
  const pattern = resolved
    ? /^git\+(?:https:\/\/github\.com\/cordisx\/cordisxmono\.git|ssh:\/\/git@github\.com\/cordisx\/cordisxmono\.git)#([a-f0-9]{40})$/u
    : /^(?:github:cordisx\/cordisxmono|git\+https:\/\/github\.com\/cordisx\/cordisxmono\.git)#([a-f0-9]{40})$/u
  const match = pattern.exec(value)
  return match?.[1] === ref
}

function requireReferences(options, packageJson, formatter, errors) {
  const { repo, profile, policyRoot, policyRef, provider } = options
  const target = `tooling/quality/dprint/${profile === 'format-only' ? 'docs' : 'code'}.json`
  const extended = typeof formatter.extends === 'string' ? [formatter.extends] : formatter.extends
  const expected = provider
    ? path.join(policyRoot, target)
    : `https://raw.githubusercontent.com/cordisx/cordisxmono/${policyRef}/${target}`
  const references = Array.isArray(extended) ? extended : []
  const matches = references.some(value =>
    typeof value === 'string' && (
      provider ? path.resolve(repo, value) === expected : value === expected
    )
  )
  if (!matches) errors.push(`dprint extends must consume ${expected}`)
  if (
    !provider && references.some(value =>
      typeof value === 'string'
      && value.startsWith('https://raw.githubusercontent.com/cordisx/cordisxmono/') && value !== expected
    )
  ) {
    errors.push('dprint extends contains a second or mismatched Mono policy reference')
  }
  for (const key of ['includes', 'excludes']) {
    if (
      !Array.isArray(formatter[key]) || formatter[key].some(value => typeof value !== 'string')
      || key === 'includes' && formatter[key].length === 0
    ) {
      errors.push(`dprint ${key} must be declared locally as ${key === 'includes' ? 'a nonempty' : 'an'} array`)
    }
  }
  if (provider) {
    if (repo !== policyRoot || packageJson.name !== packageName) {
      errors.push('--provider requires the policy package itself as both --repo and --policy-root')
    }
    return
  }
  if (profile === 'format-only') return
  if (!gitReference(packageJson.devDependencies?.[packageName], policyRef)) {
    errors.push(`${packageName} devDependency must pin canonical cordisx/cordisxmono Git at ${policyRef}`)
  }
  try {
    const lock = json(path.join(repo, 'package-lock.json'))
    if (!gitReference(lock.packages?.['']?.devDependencies?.[packageName], policyRef)) {
      errors.push('The root lock dependency does not match the canonical Mono policy SHA')
    }
    if (!gitReference(lock.packages?.[`node_modules/${packageName}`]?.resolved, policyRef, true)) {
      errors.push('The installed policy lock resolved URL does not match the canonical Mono policy SHA')
    }
  } catch (error) {
    errors.push(`Policy lock could not be read: ${error.message}`)
  }
}

async function inspectEslint(options, files, policy, errors) {
  const require = createRequire(path.join(options.repo, 'package.json'))
  const { ESLint } = require('eslint')
  const engine = new ESLint({ cwd: options.repo })
  const expectedEngine = new ESLint({
    cwd: options.repo,
    overrideConfigFile: true,
    overrideConfig: [{ ...policy, files: [codePattern] }],
  })
  const expected = await expectedEngine.calculateConfigForFile(path.join(options.repo, '__policy_reference__.js'))
  const result = {
    version: require('eslint/package.json').version,
    configurationFiles: [],
    covered: [],
    ignored: [],
    probes: [],
  }
  const parserIds = new WeakMap()
  let parserSequence = 0
  const representatives = new Map()
  for (const file of files.filter(file => codeExtension.test(file))) {
    const absolute = path.join(options.repo, file)
    if (await engine.isPathIgnored(absolute)) {
      result.ignored.push({ path: file, role: role(file) })
      continue
    }
    const actual = await engine.calculateConfigForFile(absolute)
    if (!actual) {
      result.ignored.push({ path: file, role: role(file) })
      continue
    }
    const mismatches = []
    for (const name of Object.keys(expected.rules ?? {})) {
      if (!isDeepStrictEqual(actual.rules?.[name], expected.rules[name])) mismatches.push(`rule ${name}`)
    }
    if (actual.linterOptions?.noInlineConfig !== expected.linterOptions?.noInlineConfig) {
      mismatches.push('noInlineConfig')
    }
    for (const name of Object.keys(expected.settings ?? {})) {
      if (!isDeepStrictEqual(actual.settings?.[name], expected.settings[name])) mismatches.push(`setting ${name}`)
    }
    if (mismatches.length) errors.push(`${file}: effective shared policy differs (${mismatches.join(', ')})`)
    const parser = actual.languageOptions?.parser
    if (parser && !parserIds.has(parser)) parserIds.set(parser, parserSequence++)
    const parserName = parser?.meta?.name ?? parser?.name ?? 'unknown'
    const entry = { path: file, role: role(file), policyMatches: mismatches.length === 0, parser: parserName }
    result.covered.push(entry)
    if (entry.role === 'configuration') result.configurationFiles.push(file)
    if (entry.role !== 'configuration' && entry.policyMatches) {
      const group = JSON.stringify([
        path.extname(file),
        parserIds.get(parser),
        actual.languageOptions?.ecmaVersion,
        actual.languageOptions?.sourceType,
        actual.languageOptions?.parserOptions,
      ])
      if (!representatives.has(group)) representatives.set(group, entry)
    }
  }
  const sources = files.filter(file => role(file) === 'source')
  const tests = files.filter(file => role(file) === 'test')
  const candidates = sources.length ? sources : files.filter(file => codeExtension.test(file))
  if (!candidates.some(file => result.covered.some(entry => entry.path === file))) {
    errors.push('ESLint covers no tracked source files (a bootstrap config alone is not source coverage)')
  }
  if (tests.length && !result.covered.some(entry => entry.role === 'test')) {
    errors.push('ESLint ignores every tracked test/conformance file')
  }
  const typed = candidates.filter(file => typedExtension.test(file))
  if (
    ['typescript', 'next'].includes(options.profile) && typed.length
    && !result.covered.some(entry => typed.includes(entry.path))
  ) errors.push('ESLint covers no tracked TypeScript source')

  for (const { path: file, parser } of representatives.values()) {
    const jsx = /\.[jt]sx$/u.test(file)
    const language = jsx
      ? typedExtension.test(file) ? 'tsx' : 'jsx'
      : typedExtension.test(file)
      ? 'typescript'
      : 'javascript'
    for (const inlineDisable of [false, true]) {
      // Fixed synthetic input only; source file contents and their lengths are never inspected here.
      const statements = Array(1001).fill('void 0;')
      const first = inlineDisable ? 1 : 0
      if (inlineDisable) statements[0] = '/* eslint-disable max-lines */'
      if (typedExtension.test(file)) statements[first] = 'const qualityProbe: number = 0;'
      if (jsx) {
        statements[first] = typedExtension.test(file)
          ? 'const qualityProbe: unknown = <span />;'
          : 'const qualityProbe = <span />;'
      }
      const [probe] = await engine.lintText(statements.join('\n'), { filePath: path.join(options.repo, file) })
      const detected = probe.messages.some(message => message.ruleId === 'max-lines' && message.severity === 2)
      const fatal = probe.messages.filter(message => message.fatal).map(message => message.message)
      result.probes.push({ file, language, parser, inlineDisable, maxLinesError: detected, fatal })
      if (!detected || fatal.length) {
        errors.push(
          `${file}: standard ESLint synthetic enforcement probe failed${inlineDisable ? ' with inline disable' : ''}`,
        )
      }
    }
  }
  if (!result.probes.length) errors.push('No eligible source configuration was available for the ESLint probe')
  return result
}

function inspectFormatter(options, files, configFile, errors) {
  let require = createRequire(path.join(options.repo, 'package.json'))
  let packageFile
  let source = 'owner'
  try {
    packageFile = require.resolve('dprint/package.json')
  } catch (error) {
    if (options.profile !== 'format-only') throw error
    require = createRequire(path.join(options.policyRoot, 'package.json'))
    packageFile = require.resolve('dprint/package.json')
    source = 'policy-root tool for format-only owner'
  }
  const metadata = json(packageFile)
  const bin = typeof metadata.bin === 'string' ? metadata.bin : metadata.bin?.dprint
  if (!bin) throw new Error('Installed dprint package has no CLI entry')
  const entry = path.resolve(path.dirname(packageFile), bin)
  const run = command =>
    execFileSync(process.execPath, [entry, command, '--config', configFile], {
      cwd: options.repo,
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
      timeout: 120_000,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
  const resolved = JSON.parse(run('output-resolved-config'))
  if (!Object.keys(resolved).length) errors.push('dprint resolved no formatter plugins')
  const paths = new Set(
    run('output-file-paths').split(/\r?\n/u).filter(Boolean).map(file => path.resolve(options.repo, file)),
  )
  const covered = files.filter(file => paths.has(path.join(options.repo, file)))
  const ignored = files.filter(file => !paths.has(path.join(options.repo, file)))
  const sources = files.filter(file => role(file) === 'source')
  const tests = files.filter(file => role(file) === 'test')
  const documents = files.filter(file => role(file) === 'document')
  const meaningful = covered.filter(file =>
    role(file) !== 'configuration'
    && !['dprint.json', 'dprint.jsonc', '.dprint.json', 'package.json', 'package-lock.json'].includes(file)
  )
  if (!meaningful.length) {
    errors.push('dprint covers no tracked source/document files; configuration-only coverage is insufficient')
  }
  if (options.profile !== 'format-only' && sources.length && !sources.some(file => covered.includes(file))) {
    errors.push('dprint covers no tracked source files')
  }
  if (tests.length && !tests.some(file => covered.includes(file))) {
    errors.push('dprint ignores every tracked test/conformance file')
  }
  if (options.profile === 'format-only' && documents.length && !documents.some(file => covered.includes(file))) {
    errors.push('dprint covers no tracked documentation files')
  }
  return { version: metadata.version, source, resolved, covered, ignored }
}

export async function auditQuality(input) {
  const options = { ...input, repo: path.resolve(input.repo), policyRoot: path.resolve(input.policyRoot) }
  const errors = []
  const report = {
    ok: false,
    scope:
      'Configuration consumption and synthetic enforcement only; not a full source lint, formatting result, or npm-script/CI-wiring audit.',
    repository: options.repo,
    profile: options.profile,
    policyRef: options.policyRef,
    provider: Boolean(options.provider),
    errors,
  }
  try {
    options.repo = realpathSync(options.repo)
    options.policyRoot = realpathSync(options.policyRoot)
    report.repository = options.repo
    if (!profiles.has(options.profile)) throw new Error(`Unsupported profile: ${options.profile}`)
    if (!/^[a-f0-9]{40}$/u.test(options.policyRef ?? '')) {
      throw new Error('--policy-ref must be a full lowercase Git SHA')
    }
    const packageFile = path.join(options.repo, 'package.json')
    const packageJson = existsSync(packageFile) ? json(packageFile) : {}
    const policyPackage = json(path.join(options.policyRoot, 'package.json'))
    const policy =
      (await import(pathToFileURL(path.join(options.policyRoot, 'tooling/quality/eslint-policy.mjs')).href)).default
    if (
      policyPackage.name !== packageName || !policy?.rules?.['max-lines']
      || policy.linterOptions?.noInlineConfig !== true
      || policy.settings?.[versionKey] !== policyPackage.version
    ) throw new Error('Policy root has an incomplete shared policy/version marker')
    report.policyVersion = policyPackage.version
    const localName = ['dprint.json', 'dprint.jsonc', '.dprint.json'].find(file =>
      existsSync(path.join(options.repo, file))
    )
    if (!localName) throw new Error('Owner has no local dprint configuration')
    const configFile = path.join(options.repo, localName)
    const formatter = json(configFile)
    requireReferences(options, packageJson, formatter, errors)
    const tracked = trackedFiles(options.repo)
    report.trackedFiles = tracked.files.length
    report.skippedGitEntries = tracked.skipped
    if (options.profile === 'format-only' && tracked.files.some(file => codeExtension.test(file))) {
      errors.push('format-only profile contains tracked JS/TS source or governance code; select a code profile')
    }
    if (errors.length) return report
    if (options.profile !== 'format-only') {
      try {
        report.eslint = await inspectEslint(options, tracked.files, policy, errors)
      } catch (error) {
        errors.push(`ESLint configuration inspection failed: ${error.message}`)
      }
    }
    try {
      report.dprint = inspectFormatter(options, tracked.files, configFile, errors)
    } catch (error) {
      errors.push(`dprint inspection failed: ${error.stderr?.toString().trim() || error.message}`)
    }
  } catch (error) {
    errors.push(error.message)
  }
  report.ok = errors.length === 0
  return report
}

function argumentsFrom(argv) {
  const result = {}
  const names = { '--repo': 'repo', '--profile': 'profile', '--policy-root': 'policyRoot', '--policy-ref': 'policyRef' }
  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index]
    if (argument === '--provider' || argument === '--json') result[argument.slice(2)] = true
    else if (names[argument] && argv[index + 1] && !argv[index + 1].startsWith('--')) {
      result[names[argument]] = argv[++index]
    } else throw new Error(`Unknown or incomplete argument: ${argument}`)
  }
  for (const key of Object.values(names)) if (!result[key]) throw new Error(`Missing ${key} argument`)
  return result
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    const options = argumentsFrom(process.argv.slice(2))
    const report = await auditQuality(options)
    if (options.json) console.log(JSON.stringify(report, null, 2))
    else {
      console.log(`Quality consumption: ${report.ok ? 'PASS' : 'FAIL'} (${report.profile})`)
      console.log(report.repository)
      if (report.eslint) {
        console.log(
          `ESLint configurations: ${report.eslint.covered.length} covered, ${report.eslint.ignored.length} ignored; ${report.eslint.probes.length} synthetic probes`,
        )
      }
      if (report.dprint) {
        console.log(
          `dprint scope: ${report.dprint.covered.length} tracked files covered, ${report.dprint.ignored.length} ignored`,
        )
      }
      for (const error of report.errors) console.error(`ERROR: ${error}`)
      console.log(report.scope)
      console.log('Ignored paths are reported in --json; their legitimacy is not certified by this audit.')
    }
    process.exitCode = report.ok ? 0 : 1
  } catch (error) {
    console.error(error.message)
    console.error(
      'Usage: check-quality.mjs --repo PATH --profile javascript|typescript|next|format-only --policy-root PATH --policy-ref SHA [--provider] [--json]',
    )
    process.exitCode = 2
  }
}
