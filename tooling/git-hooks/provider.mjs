import { createHash } from 'node:crypto'
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { join } from 'node:path'
import { dependency } from './runtime.mjs'

const core = ['runner.mjs', 'runtime.mjs', 'push.mjs', 'snapshot.mjs']
const hash = (value) => createHash('sha256').update(value).digest('hex')
const ready = 'cordisx-format-provider-snapshot-v1\n'

function validate(path) {
  if (readFileSync(join(path, 'READY'), 'utf8') !== ready) {
    throw new Error(`Refusing unmanaged or incomplete provider snapshot: ${path}`)
  }
  for (const name of ['lint-staged', 'dprint/bin.cjs', 'jsonc-parser']) dependency(path, path, name)
}

// Build in a fresh directory: npm's .bin symlinks cannot safely be copied over
// themselves. Existing complete snapshots remain untouched while hooks use them.
function publish(parent, fingerprint, build) {
  mkdirSync(parent, { recursive: true })
  const destination = join(parent, fingerprint)
  if (existsSync(destination)) {
    validate(destination)
    return destination
  }
  const temporary = mkdtempSync(join(parent, '.building-'))
  try {
    build(temporary)
    writeFileSync(join(temporary, 'READY'), ready)
    validate(temporary)
    try {
      renameSync(temporary, destination)
    } catch (error) {
      // Another installer may have published the same complete snapshot.
      if (!['EEXIST', 'ENOTEMPTY'].includes(error.code)) throw error
      validate(destination)
    }
    return destination
  } finally {
    // Only this invocation's uniquely created temporary directory is removed.
    rmSync(temporary, { recursive: true, force: true })
  }
}

export function publishRuntime(runtime, provider, source) {
  const packageText = readFileSync(join(provider, 'package.json'), 'utf8')
  const lockPath = join(provider, 'package-lock.json')
  const hasLock = existsSync(lockPath)
  const packageValue = JSON.parse(packageText)
  const lockText = hasLock ? readFileSync(lockPath, 'utf8') : JSON.stringify({
    dependencies: packageValue.dependencies,
    devDependencies: packageValue.devDependencies,
    optionalDependencies: packageValue.optionalDependencies,
  })
  const dependencyId = hash(`${process.platform}/${process.arch}\n${lockText}`)
  const dependencies = publish(join(runtime, 'dependencies'), dependencyId, (temporary) => {
    cpSync(realpathSync(join(provider, 'node_modules')), join(temporary, 'node_modules'), {
      recursive: true,
      verbatimSymlinks: true,
    })
    writeFileSync(join(temporary, 'package.json'), packageText)
    if (hasLock) writeFileSync(join(temporary, 'package-lock.json'), lockText)
  })
  const releaseId = hash(dependencyId + core.map((name) => readFileSync(join(source, name), 'utf8')).join('\n'))
  const release = publish(join(runtime, 'releases'), releaseId, (temporary) => {
    symlinkSync(join(dependencies, 'node_modules'), join(temporary, 'node_modules'), 'dir')
    writeFileSync(join(temporary, 'package.json'), packageText)
    for (const name of core) copyFileSync(join(source, name), join(temporary, name))
  })
  const bootstrap = [
    "import { fileURLToPath } from 'node:url'",
    `const release = new URL('./releases/${releaseId}/', import.meta.url)`,
    'process.argv[3] = fileURLToPath(release)',
    "await import(new URL('runner.mjs', release))",
    '',
  ].join('\n')
  const target = join(runtime, 'runner.mjs')
  if (!existsSync(target) || readFileSync(target, 'utf8') !== bootstrap) {
    const temporary = mkdtempSync(join(runtime, '.activation-'))
    try {
      const file = join(temporary, 'runner.mjs')
      writeFileSync(file, bootstrap)
      renameSync(file, target)
    } finally {
      rmSync(temporary, { recursive: true, force: true })
    }
  }
  return { dependencyId, releaseId, dependencies, release }
}
