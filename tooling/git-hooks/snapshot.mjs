import { existsSync, mkdirSync, symlinkSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, isAbsolute, join, posix } from 'node:path'
import { dependency, git, run, selectedFiles } from './runtime.mjs'

// Metadata only: large unmodified assets never enter a blob read or buffer.
export function treeEntries(root, commit) {
  return git(root, ['ls-tree', '-rz', commit]).split('\0').filter(Boolean)
    .map((entry) => {
      const tab = entry.indexOf('\t')
      const [mode, type, oid] = entry.slice(0, tab).split(' ')
      return { mode, type, oid, path: entry.slice(tab + 1) }
    }).filter(({ mode, type }) => type === 'blob' && mode !== '120000')
}

export function materialize(root, provider, commit, snapshot, files, options = {}) {
  const entries = options.entries || treeEntries(root, commit)
  const byPath = new Map(entries.map((entry) => [entry.path, entry]))
  const readBlob = options.readBlob || ((entry) => run('git', ['-C', root, 'cat-file', 'blob', entry.oid]))
  const written = new Set()
  const write = (path, content) => {
    if (path.startsWith('../') || isAbsolute(path)) throw new Error(`Snapshot path escapes root: ${path}`)
    const target = join(snapshot, path)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, content)
  }
  const copy = (path) => {
    const entry = byPath.get(path)
    if (!entry) throw new Error(`Committed configuration dependency is missing or a symlink: ${path}`)
    const content = readBlob(entry)
    write(path, content)
    written.add(path)
    return content
  }
  const parse = createRequire(import.meta.url)(dependency(root, provider, 'jsonc-parser')).parse
  const configNames = ['dprint.json', 'dprint.jsonc', '.dprint.json', '.dprint.jsonc']
  const config = configNames.find((name) => byPath.has(name))
  if (!config) throw new Error('No committed owner dprint config')
  const loadConfig = (path) => {
    if (written.has(path)) return
    const errors = []
    const value = parse(copy(path).toString(), errors, { allowTrailingComma: true })
    if (errors.length) throw new Error(`Invalid committed formatter config: ${path}`)
    const local = (reference) => {
      if (typeof reference !== 'string' || /^[a-z]+:/i.test(reference) || isAbsolute(reference)) return null
      const target = posix.normalize(posix.join(posix.dirname(path), reference))
      if (target.startsWith('../')) throw new Error(`Formatter config escapes repository: ${reference}`)
      // Installed package configuration stays with the existing owner install.
      if (target.startsWith('node_modules/')) return null
      return target
    }
    for (const reference of [value.extends || []].flat()) {
      const target = local(reference)
      if (target) loadConfig(target)
    }
    for (const reference of value.plugins || []) {
      const target = local(reference)
      if (target && !written.has(target)) copy(target)
    }
  }
  loadConfig(config)
  const candidates = files.filter((path) => byPath.has(path))
  for (const path of candidates) {
    if (!written.has(path)) write(path, Buffer.alloc(0))
    let directory = posix.dirname(path)
    while (true) {
      const ignore = directory === '.' ? '.gitignore' : `${directory}/.gitignore`
      if (byPath.has(ignore) && !written.has(ignore)) copy(ignore)
      if (directory === '.') break
      directory = posix.dirname(directory)
    }
  }
  if (!existsSync(join(snapshot, 'node_modules')) && existsSync(join(root, 'node_modules'))) {
    symlinkSync(join(root, 'node_modules'), join(snapshot, 'node_modules'), 'dir')
  }
  const selected = selectedFiles(snapshot, provider, candidates, root)
  for (const path of selected) if (!written.has(path)) copy(path)
  return selected
}
