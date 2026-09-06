# Shared quality configuration

This guide is for repository maintainers integrating the organization-wide
[formatting and size policy](../rules/file-size.md). Mono owns the shared
configuration and repository coverage checks. Owners retain their source paths,
generated-file exclusions, parsers and existing framework checks.

## Configuration layers

| Layer                                                                                                  | Authority                                                                              |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| [ESLint policy](../../tooling/quality/eslint-policy.mjs)                                               | Standard `max-lines`, inline configuration policy and package-version marker           |
| [dprint common](../../tooling/quality/dprint/common.json)                                              | Shared whitespace and Markdown settings                                                |
| [dprint code](../../tooling/quality/dprint/code.json) / [docs](../../tooling/quality/dprint/docs.json) | Fixed language plugins and code style, preserving module declaration order             |
| Owner config                                                                                           | Local includes/excludes, JavaScript/TypeScript parser and existing Next or other rules |
| [Ownership table](organization-context.md#repository-ownership)                                        | Repository identity and required quality profile; it is the only inventory             |

Profiles are required targets, not evidence of completed migration. Declaring a
profile does not imply that a pinned owner consumes the shared configuration or
passes full-source lint. The first formatting checkpoint remains documented
[separately](history/formatting-baseline-2026-09-05.md).

## Pin the provider and keep owner entry points small

After the provider has formally merged, use its full mainline commit SHA for
both consumers below. Never substitute a moving branch or a candidate SHA in a
formal owner delivery.

- Install `@cordisx/eslint-config` as a development dependency using
  `github:cordisx/cordisxmono#<full-provider-sha>` and commit npm's resulting lock.
  Preserve its resolved URL and any integrity field. npm may record the canonical
  Git URL using HTTPS or SSH. npm 12 requires its normal `--allow-git=root` scope.
- Set the local dprint `extends` to
  `https://raw.githubusercontent.com/cordisx/cordisxmono/<full-provider-sha>/tooling/quality/dprint/code.json`.
  `format-only` owners use `docs.json` and need no empty ESLint dependency/job.
- Keep `includes` and `excludes` local. dprint ignores them in remote extended
  configuration. Preserve necessary owner style overrides, such as JSX quotes
  or semicolons, so consuming shared defaults does not introduce another bulk
  formatting change.

The Mono package is private and has no install, prepare or build lifecycle. Its
package allowlist contains only pure config files; it is not published to npm.
A fixed Git dependency normally uses npm's archive fast path and package
allowlist. If that request fails, npm may fall back to a Git clone, including
submodules. Do not describe it as a guaranteed submodule-free installation.
An archive's compressed bytes are not a permanent Git content identity; retain
the normal Git dependency and npm-generated lock instead of substituting a
direct archive URL or deleting integrity metadata.

A JavaScript owner can compose the shared object using ESLint's normal API:

```js
import { defineConfig, globalIgnores } from 'eslint/config'
import sourcePolicy from '@cordisx/eslint-config'

export default defineConfig([
  globalIgnores(['node_modules/**', 'dist/**']),
  { files: ['**/*.{js,mjs,cjs,jsx}'], extends: [sourcePolicy] },
])
```

TypeScript owners extend this scope with their maintained TypeScript files and
configure `@typescript-eslint/parser`. Next owners keep their existing Next
configuration and add the shared policy after it. Do not replace existing checks
or hide maintained test/conformance directories. Explain precise generated or
frozen exclusions beside the owner config.

## Verify actual consumption

The existing registration check stays offline and reads a single Git snapshot:

```sh
python3 -B scripts/check-repositories.py --revision HEAD --json
```

Its `self`, `public` and `skipped` records contain the required profile and exact
gitlink revision. Private repositories appear only in `skipped`; the check does
not initialize submodules, install dependencies or execute owner configs.

After installing the relevant standard tools in an isolated owner checkout,
run the separate audit from this Mono checkout:

```sh
node scripts/check-quality.mjs --repo /absolute/owner-checkout \
  --profile typescript --policy-root /absolute/provider-checkout \
  --policy-ref <full-provider-sha> --json
```

For Mono itself, use `--provider`, its `javascript` profile and the same path for
`--repo` and `--policy-root`. The audit checks the provider ref in package/lock
and dprint, calls ESLint's effective-config API for tracked JS/TS files, and
uses dprint's resolved-config and file-path outputs. Synthetic 1001-line input
is passed to the actual ESLint rule, including an attempted inline disable.
It does not implement a line counter or inspect product source length.

The report lists ignored paths; review their legitimacy. An entire source or
test tree disappearing, a disabled limit or a missing provider reference fails.
Partial exclusions still require owner review. Configuration execution is code
execution: run this separate stage on isolated CI workers with read-only
permissions, no persisted Git credentials and no product secrets.

The manual **Quality consumption** workflow derives its matrix from that same
committed inventory and checks the exact pinned public owners. It takes a formal
provider SHA and skips private mounts. It is a rollout audit; owners that still
have standalone phase-one configs fail visibly. It is not a required product
gate during migration. The ordinary Mono **Quality configuration** job verifies
the provider itself on every change.

## Report enforcement scope honestly

Keep three results separate: configuration consumption, `dprint check`, and
full-source `eslint .`. The audit proves configuration and synthetic enforcement;
it does not certify source lint or formatting. Existing oversized files must
remain visible as ESLint errors until their owners make cohesive refactors.
Do not raise their thresholds or add a suppression baseline to get a green job.

The package exports a pure `@cordisx/eslint-config/lint-staged` mapping for owners
that deliberately introduce a changed-file check with standard `lint-staged`.
Such a check covers only its declared diff/staged files; it is not full-source
lint and is not enabled by importing the shared ESLint config. Coordinate its
activation with active owner work instead of silently adding a new blocking
gate to a recovery delivery.

References: [ESLint configuration](https://eslint.org/docs/latest/use/configure/configuration-files),
[max-lines](https://eslint.org/docs/latest/rules/max-lines),
[dprint configuration](https://dprint.dev/config/), and
[npm Git dependencies](https://docs.npmjs.com/cli/v10/configuring-npm/package-json/#git-urls-as-dependencies).
