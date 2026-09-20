# Local formatting hooks

Use these hooks to fix formatting before commit and catch formatting drift in
committed changes before push. They use each repository's dprint configuration;
CI remains authoritative. They do not run full builds, lint autofixes, or tests.

## Setup

From a current Mono checkout with the locked tools installed:

```sh
npm ci --ignore-scripts
npm run hooks:status
npm run hooks:install
```

The default inventory covers Mono and its initialized public submodules. Private
`update = none` mounts and uninitialized submodules are reported and skipped.
Missing owner dprint configuration or existing custom hooks/hooksPath is a
conflict: resolve it before installation. No existing custom hook is overwritten.

For another checkout, including a standalone plugin:

```sh
node /path/to/mono/tooling/git-hooks/install.mjs --root /path/to/plugin --provider /path/to/mono
node /path/to/mono/tooling/git-hooks/install.mjs --root /path/to/plugin --provider /path/to/mono --install
```

Installation copies one shared runtime and the provider's installed tool
snapshot into its Git common directory. It does not depend on the provider
worktree remaining present, run an npm install, or modify global Git settings.
Wrappers use the current machine's Node binary; rerun setup after removing or
relocating that Node installation. A new clone needs explicit setup because Git
does not install repository hooks on clone.

## Behavior

- `pre-commit` uses lint-staged's backup and partial-staging support. Only staged
  files are formatted and restaged; unrelated unstaged and untracked work stays
  out of the commit. Formatter failure restores the index and working tree.
- `pre-push` checks changed files at each pushed ref's final committed tip, not
  an uncommitted working-tree fix. It never amends history or changes checkout
  contents. Format the affected source, commit the correction, then push again.
- Owner exclusions remain in effect. Build output, third-party and generated
  files follow the owner's policy; fix a generator rather than repeatedly fixing
  its output. Changing the formatter policy does not turn this hook into a
  full-repository formatting migration.

Create the initial repository commit before installing the hooks: there is no
recovery baseline for an unborn HEAD. If a push's remote object is unavailable
locally, explicitly fetch the relevant history before retrying. Hooks do not
fetch Git history or install missing tools. dprint itself may download its
configured plugins when its cache is cold; warm that cache before working offline.

## Removal and checks

```sh
npm run hooks:uninstall
npm run test:hooks
```

Removal only deletes managed pre-commit/pre-push wrappers for the selected
inventory. It retains the shared runtime for other repositories using it. Use
`--root` and `--provider` for the same explicit scope as setup.
