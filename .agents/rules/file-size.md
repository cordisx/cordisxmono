# Formatting and file size

Apply this rule before adding or expanding source, tests, configuration, or
documentation. Keep the tools' responsibilities separate:

The [formatting checkpoint](../docs/history/formatting-baseline-2026-09-05.md)
records the initial owner rollout. The [shared tooling guide](../docs/quality-tooling.md)
explains configuration consumption and how to distinguish a configured limit
from a passing full-source check.

- **dprint owns formatting:** indentation, quotes, whitespace and wrapping for
  the languages enabled by the owner's configuration. Use `dprint fmt` to format
  and `dprint check` to check. Its `lineWidth` is a preferred line width, not a
  file-length limit.
- **ESLint owns source lint rules:** enable the built-in `max-lines` rule for
  JavaScript and TypeScript, including their tests. Keep formatting rules out of
  ESLint when dprint owns them. TypeScript uses the standard TypeScript parser.
- **Module design remains an engineering responsibility:** at about 800 lines,
  read [the splitting guide](../docs/splitting-files.md) before adding another
  responsibility. This is a review trigger, not an extra custom lint rule.

## The 1000-line rule

Consume the shared [ESLint policy](../../tooling/quality/eslint-policy.mjs)
through the owning repository's flat config. It uses the standard `max-lines`
rule with a maximum of 1000 and counts blank lines and comments. The shared
policy also disables inline configuration; a source comment cannot raise or
disable the limit. Owners retain their parser and existing framework rules.

Exactly 1000 lines is allowed. Blank lines and comments count. Format the code
before checking its size; do not compress lines or delete useful explanations
to fit under the limit. This rule does not measure architectural cohesion.

Existing oversized source files are reported by ESLint. Do not silence them
with bulk suppressions, automatic baseline generation, or larger per-file
limits. Plan cohesive owner refactors and report the existing violations
honestly. An initial lint/format configuration is not evidence that the existing
repository passes it; clear the applicable debt before claiming a green gate.

Documentation and other maintained files retain the same design target, but
the JavaScript/TypeScript ESLint configuration does not automatically lint
their file lengths. dprint checks their formatting only where a plugin is
configured. Report these scopes explicitly.

## Scope and checks

Keep formatter and linter configurations with their owning repository. Exclude
dependency directories, build output and verified generated artifacts through
the tools' standard configuration, with a reason for non-obvious exclusions.
Do not exclude whole test trees to hide maintained code. Preserve frozen
protocol material and generated lockfiles; their producers own their layout.

Repositories with npm tooling expose `format`, `format:check` and `lint` scripts.
CI calls the standard tools directly. Mono also lints its own JavaScript tooling;
the organization profile has formatting only while it has no JS/TS code.
The shared package contains pure configuration, with no custom file-size rule
or owner runtime. The separate consumption audit asks the installed native tools
for their effective configuration and file coverage; it does not measure source
length or replace owner lint/format checks.

Run formatting on the files you are changing, then lint and the owner-required
behavior checks. Keep a bulk formatting or architectural migration separately
reviewable. Update documentation indexes and links when splitting pages.

References: [dprint configuration](https://dprint.dev/config/) and
[ESLint max-lines](https://eslint.org/docs/latest/rules/max-lines).
