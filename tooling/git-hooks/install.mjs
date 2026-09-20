import {
  chmodSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { configPath, dependency, git } from './runtime.mjs'
import { publishRuntime } from './provider.mjs'

const marker = '# cordisx-managed-format-hooks-v1'
const source = dirname(fileURLToPath(import.meta.url))
const present = (path) => {
  try {
    return lstatSync(path)
  } catch (error) {
    if (error.code === 'ENOENT') return null
    throw error
  }
}
const quote = (value) => `'${value.replaceAll("'", "'\\''")}'`

export function inventory(root) {
  const repos = [{ path: root, state: 'candidate' }]
  if (!existsSync(join(root, '.gitmodules'))) return repos
  const entries = git(root, ['config', '-z', '-f', '.gitmodules', '--get-regexp', '^submodule\\..*\\.path$'])
  for (const record of entries.split('\0').filter(Boolean)) {
    const separator = record.indexOf('\n')
    const key = record.slice(0, separator)
    const path = record.slice(separator + 1)
    let update = ''
    try {
      update = git(root, ['config', '-f', '.gitmodules', '--get', key.replace(/\.path$/, '.update')]).trim()
    } catch {}
    // Skip before checking anything inside the private/uninitialized checkout.
    if (update === 'none') {
      repos.push({ path, state: 'skipped-private' })
      continue
    }
    const absolute = resolve(root, path)
    if (!absolute.startsWith(`${root}/`)) throw new Error(`Invalid submodule path: ${path}`)
    repos.push({ path: absolute, state: existsSync(join(absolute, '.git')) ? 'candidate' : 'skipped-uninitialized' })
  }
  return repos
}

export function install({ root, provider, apply = false, uninstall = false }) {
  root = realpathSync(root)
  provider = realpathSync(provider)
  const common = resolve(provider, git(provider, ['rev-parse', '--git-common-dir']).trim())
  if (!uninstall) {
    dependency(provider, provider, 'lint-staged')
    dependency(provider, provider, 'dprint/bin.cjs')
    dependency(provider, provider, 'jsonc-parser')
  }
  const runtime = join(common, 'cordisx-format-hooks-v1')
  const owned = join(runtime, 'MANAGED')
  if (existsSync(runtime) && (!existsSync(owned) || readFileSync(owned, 'utf8') !== marker)) {
    throw new Error(`Refusing unmanaged provider directory: ${runtime}`)
  }
  const report = inventory(root).map((repo) => {
    if (repo.state !== 'candidate') return repo
    try {
      if (!uninstall) configPath(repo.path)
      let custom
      try {
        custom = git(repo.path, ['config', '--get', 'core.hooksPath']).trim()
      } catch {}
      if (custom !== undefined) throw new Error(`Existing core.hooksPath: ${custom}`)
      const hooks = resolve(repo.path, git(repo.path, ['rev-parse', '--git-path', 'hooks']).trim())
      let managedCount = 0
      let enabledCount = 0
      for (const name of ['pre-commit', 'pre-push']) {
        const target = join(hooks, name)
        const existing = present(target)
        if (
          existing && (existing.isSymbolicLink() || !readFileSync(target, 'utf8').startsWith(`#!/bin/sh\n${marker}\n`))
        ) {
          throw new Error(`Existing custom hook: ${target}`)
        }
        if (existing) {
          managedCount++
          if ((existing.mode & 0o111) !== 0) enabledCount++
        }
      }
      return { ...repo, state: 'ready', hooks, managed: managedCount > 0, installed: enabledCount === 2 }
    } catch (error) {
      return { ...repo, state: 'conflict', reason: error.message }
    }
  })
  if (apply) {
    if (report.some(({ state }) => state === 'conflict')) {
      throw new Error(`Nothing installed; resolve conflicts first:\n${JSON.stringify(report, null, 2)}`)
    }
    if (uninstall) {
      for (const repo of report.filter(({ state }) => state === 'ready')) {
        for (const name of ['pre-commit', 'pre-push']) {
          const target = join(repo.hooks, name)
          if (existsSync(target)) unlinkSync(target)
        }
        repo.state = 'uninstalled'
        repo.managed = false
        repo.installed = false
      }
      return { provider, runtime, apply, repositories: report }
    }
    mkdirSync(runtime, { recursive: true })
    writeFileSync(owned, marker)
    publishRuntime(runtime, provider, source)
    for (const repo of report.filter(({ state }) => state === 'ready')) {
      mkdirSync(repo.hooks, { recursive: true })
      for (const name of ['pre-commit', 'pre-push']) {
        const target = join(repo.hooks, name)
        writeFileSync(
          target,
          `#!/bin/sh\n${marker}\nexec ${quote(process.execPath)} ${quote(join(runtime, 'runner.mjs'))} ${name} ${
            quote(runtime)
          } "$@"\n`,
        )
        chmodSync(target, 0o755)
      }
      repo.state = 'installed'
      repo.managed = true
      repo.installed = true
    }
  }
  return { provider, runtime, apply, repositories: report }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2)
    const value = (flag, fallback) => args.includes(flag) ? args[args.indexOf(flag) + 1] : fallback
    const root = value('--root', git(process.cwd(), ['rev-parse', '--show-toplevel']).trim())
    const provider = value('--provider', resolve(source, '../..'))
    const result = install({
      root,
      provider,
      apply: args.includes('--install') || args.includes('--uninstall'),
      uninstall: args.includes('--uninstall'),
    })
    console.log(JSON.stringify(result, null, 2))
    if (result.repositories.some(({ state }) => state === 'conflict')) process.exitCode = 1
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
