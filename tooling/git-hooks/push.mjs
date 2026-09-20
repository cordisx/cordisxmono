import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { formatFiles, git } from './runtime.mjs'

import { materialize } from './snapshot.mjs'

const zero = /^0+$/

export function incomingSnapshots(root, input, remote) {
  const snapshots = new Map()
  for (const line of input.trim().split('\n').filter(Boolean)) {
    const fields = line.trim().split(/\s+/)
    if (fields.length !== 4) throw new Error(`Invalid pre-push input: ${line}`)
    const [, local, , previous] = fields
    if (!/^[a-f0-9]{40,64}$/.test(local) || !/^[a-f0-9]{40,64}$/.test(previous)) {
      throw new Error('Invalid pre-push object ID')
    }
    if (zero.test(local)) continue
    git(root, ['cat-file', '-e', local])
    // Tags pointing at blobs/trees have no source commit to format.
    let tip
    try {
      tip = git(root, ['rev-parse', '--verify', `${local}^{commit}`]).trim()
    } catch {
      continue
    }
    let files
    if (!zero.test(previous)) {
      git(root, ['cat-file', '-e', `${previous}^{commit}`])
      files = git(root, ['diff', '--name-only', '-z', '--diff-filter=ACMR', previous, tip])
    } else {
      const args = ['log', '--format=', '--name-only', '-z', '-m', '--diff-filter=ACMR', tip]
      if (remote && git(root, ['remote']).split('\n').includes(remote)) {
        args.push('--not', `--remotes=${remote}`)
      }
      files = git(root, args)
    }
    const paths = snapshots.get(tip) || new Set()
    for (const file of files.split('\0').filter(Boolean)) paths.add(file)
    snapshots.set(tip, paths)
  }
  return [...snapshots].map(([commit, files]) => ({ commit, files: [...files] }))
}

export function checkPush(root, provider, input, remote) {
  for (const { commit, files } of incomingSnapshots(root, input, remote)) {
    if (!files.length) continue
    const snapshot = mkdtempSync(join(tmpdir(), 'cordisx-push-'))
    try {
      const selected = materialize(root, provider, commit, snapshot, files)
      formatFiles(snapshot, provider, selected, true, root)
    } catch (error) {
      throw new Error(`Push blocked at ${commit}: ${error.message}`)
    } finally {
      rmSync(snapshot, { recursive: true, force: true })
    }
  }
}
