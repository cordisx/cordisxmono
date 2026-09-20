import { spawnSync } from 'node:child_process'
import { existsSync, lstatSync, readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join, resolve } from 'node:path'

export function run(command, args, options = {}) {
  const result = spawnSync(command, args, { maxBuffer: 128 * 1024 * 1024, ...options })
  if (result.error || result.status !== 0) {
    throw new Error(`${command} failed: ${result.error?.message || result.stderr?.toString() || result.status}`)
  }
  return result.stdout
}

export function git(cwd, args) {
  return run('git', ['-C', cwd, ...args]).toString()
}

export function dependency(root, provider, name) {
  for (const base of [root, provider]) {
    try {
      return createRequire(join(base, 'package.json')).resolve(name)
    } catch {}
  }
  throw new Error(`Missing ${name}; install the owner's or provider's locked dependencies explicitly first.`)
}

export function configPath(root) {
  const name = ['dprint.json', 'dprint.jsonc', '.dprint.json', '.dprint.jsonc']
    .find((name) => existsSync(join(root, name)))
  if (!name) throw new Error(`No owner dprint config in ${root}; hook cannot choose a formatter policy.`)
  return join(root, name)
}

export function selectedFiles(root, provider, files, dependencyRoot = root) {
  const binary = dependency(dependencyRoot, provider, 'dprint/bin.cjs')
  const output = run(process.execPath, [binary, 'file-paths', '--config', configPath(root)], {
    cwd: root,
    env: { ...process.env, DPRINT_CONFIG_DISCOVERY: 'false' },
  }).toString()
  // dprint's listing is newline-delimited, but a complete literal path may itself
  // contain a newline. Match that complete path, never split Git names on lines.
  return files.filter((file) => (`\n${output}`).includes(`\n${realpathSync(resolve(root, file))}\n`))
}

// Absolute --stdin paths apply dprint's own include/exclude rules, without
// interpreting Git file names as shell arguments or glob patterns.
export function formatFiles(root, provider, files, check = false, dependencyRoot = root) {
  const binary = dependency(dependencyRoot, provider, 'dprint/bin.cjs')
  const config = configPath(root)
  const changes = []
  const candidates = []
  for (const file of files) {
    const path = resolve(root, file)
    if (!path.startsWith(`${resolve(root)}/`)) throw new Error(`Path outside repository: ${file}`)
    if (!existsSync(path) || !lstatSync(path).isFile()) continue
    if (!realpathSync(path).startsWith(`${realpathSync(root)}/`)) {
      throw new Error(`Symlink escapes repository: ${file}`)
    }
    candidates.push(file)
  }
  for (const file of selectedFiles(root, provider, candidates, dependencyRoot)) {
    const path = resolve(root, file)
    const before = readFileSync(path)
    const after = run(process.execPath, [binary, 'fmt', '--config', config, '--stdin', path], {
      cwd: root,
      input: before,
      env: { ...process.env, DPRINT_CONFIG_DISCOVERY: 'false' },
    })
    if (!before.equals(after)) changes.push({ path, after })
  }
  if (check && changes.length) {
    throw new Error(`Unformatted committed files:\n${changes.map(({ path }) => JSON.stringify(path)).join('\n')}`)
  }
  // Finish all formatter invocations before writing; lint-staged owns rollback.
  if (!check) { for (const { path, after } of changes) writeFileSync(path, after) }
}
