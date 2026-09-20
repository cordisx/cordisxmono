import { readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dependency, formatFiles, git } from './runtime.mjs'
import { checkPush } from './push.mjs'

const [mode, provider, payload] = process.argv.slice(2)
try {
  const root = git(process.cwd(), ['rev-parse', '--show-toplevel']).trim()
  if (mode === 'format') {
    formatFiles(root, provider, JSON.parse(Buffer.from(payload, 'base64').toString()))
  } else if (mode === 'pre-commit') {
    // lint-staged cannot make its recovery stash before the first commit.
    try {
      git(root, ['rev-parse', '--verify', 'HEAD'])
    } catch {
      throw new Error(
        'Initial commit has no recovery baseline. Create the initial baseline explicitly before installing these hooks.',
      )
    }
    const { default: lintStaged } = await import(pathToFileURL(dependency(root, provider, 'lint-staged')).href)
    const quote = (value) => `"${value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`
    const success = await lintStaged({
      cwd: root,
      config: {
        '*': (files) => [
          [
            process.execPath,
            fileURLToPath(import.meta.url),
            'format',
            provider,
            Buffer.from(JSON.stringify(files)).toString('base64'),
          ].map(quote).join(' '),
        ],
      },
      concurrent: false,
      quiet: true,
      stash: true,
      hideUnstaged: true,
    })
    if (!success) process.exitCode = 1
  } else if (mode === 'pre-push') {
    checkPush(root, provider, readFileSync(0, 'utf8'), payload)
  } else throw new Error(`Unknown hook mode: ${mode}`)
} catch (error) {
  console.error(`[cordisx-hooks] ${error.message}`)
  process.exitCode = 1
}
