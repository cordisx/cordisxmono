# Formatting baseline — 2026-09-05

This dated integration record describes the first dprint normalization
checkpoint. Gitlinks remain the revision authority; this page is not a live
repository inventory or a claim that every quality rule has been enabled.

## Scope and formal revisions

[Mono #78](https://github.com/cordisx/cordisxmono/pull/78) introduced the root
formatting baseline at `fbfc6f1ad08b3bae8e35750b3ab910a3ef5ce415`. The following
owner merges were then selected for the accompanying eight-gitlink update.
Each formal merge tree was checked against its reviewed candidate tree.

| Owner                | PR                                                               | Formal merge                               |
| -------------------- | ---------------------------------------------------------------- | ------------------------------------------ |
| Host                 | [#293](https://github.com/cordisx/cordisx/pull/293)              | `a56906abc3e0243143832d032e0d29160911e098` |
| Protocol             | [#102](https://github.com/cordisx/cordisx-protocol/pull/102)     | `fafbeee2ec4e396df8d3263c8a81bdcf60e02007` |
| Homepage             | [#5](https://github.com/cordisx/cordisx.github.io/pull/5)        | `31da462e1e500fd4a5db713e5e92a099e29c27e3` |
| Docs                 | [#3](https://github.com/cordisx/docs/pull/3)                     | `c57c67eceb3d39a2755bdd321d6a9464b3774d82` |
| Organization profile | [#3](https://github.com/cordisx/.github/pull/3)                  | `44f3e0d723deafa2e1cbfcc9f5824daef490e9e6` |
| Ascension            | [#14](https://github.com/cordisx/plugin-codex-ascension/pull/14) | `4c601477e44cd9b527867b8f4c0f6fe269ed9d2d` |
| Chatroom             | [#49](https://github.com/cordisx/plugin-chatroom/pull/49)        | `5a3f8f32dbcc60e73860426a59735b7753d32aa0` |
| Agent Trace          | [#8](https://github.com/cordisx/plugin-agent-trace/pull/8)       | `27dd97e2531f2eceaa11ad370ae1fe7be01fc816` |

At this snapshot, [Marketplace #4](https://github.com/cordisx/marketplace/pull/4)
passed its existing validation, formatting CI and independent code review but
still required GitHub CODEOWNER approval. It is not included in this pointer
update: Marketplace remains at `8454e9c7325e03a38dc42cb14ad6d77de0956b49`.
Private roadmap remains unchanged with `update = none` and was not initialized.

## Verification and preservation

- Host passed all 225 test files / 1278 tests, release metadata, package allowlist
  and installed-tarball checks, plus the exact candidate's full CI and format
  job. Independent TypeScript/JSON comparison found no product expression,
  public type/export, module declaration order or effective string changes.
  Six layout-sensitive source-readback tests were explicitly adapted to check
  the same table cells, DOM attributes and tokens after formatting.
- Protocol passed full conformance, type and distribution checks. Its main
  advanced during review to `3aa7d4de3d775aded3c81c72f5dae9842c6af812`
  ([#103](https://github.com/cordisx/cordisx-protocol/pull/103), module graphs).
  The formatter change was rebased, preserving that new public entry. All 43
  exports / 45 targets and 1180 frozen artifacts retain the new base's exact
  blobs. The prior 44 export targets are unchanged; three normative prose
  changes came from #103 and were preserved. This does not establish Host
  adoption of the new module-graph contract.
- Homepage and Docs passed their existing checks. Two Homepage capture
  assertions now permit formatting whitespace between the same required
  argument tokens; wrong values, reordering and inserted arguments remain
  rejected. No capture or deployment command was run by this task.
- Ascension passed its existing build, original lint and plugin checks
  (including three plugin tests). Its original lint configuration and existing
  warnings remain; its new remote gate checks formatting.
- Chatroom passed typecheck, build and 241 tests; Trace passed typecheck, build,
  27 tests and packaging checks. Their original CI and new format jobs passed.
  Independent comparison preserved admission, Room identity, approval and
  subscription behavior. Security manifests retain their original bytes.
- The organization profile passed its format CI. Referenced brand artwork,
  third-party copies, generated artifacts and frozen contract material were
  retained where their existing byte identity is meaningful.

The added tool is pinned dprint. Existing product dependency declarations,
resolved pins and dependency-lock metadata were preserved. Import/export module
declaration order is maintained. Source assertions and negative type-test
directive locations were adapted where necessary; these are explicit test
changes, not a claim that every changed line is whitespace.

## Limits of this checkpoint

Formatting covers the languages and maintained paths declared by each owner.
It does not imply every CSS, HTML, YAML, generated or frozen artifact was
reformatted. The original functional checks remain the owners' authority.

New ESLint max-lines enforcement, shared configuration distribution and
repository coverage verification are subsequent work. Existing oversized
files have not been declared fixed or granted new size exceptions. The
formatter does not enforce total file length.

Consumer package dependency pins remain unchanged; this is a source formatting
checkpoint, not a product dependency upgrade, npm publication, native App
verification or user acceptance. No shared preview or its inputs were changed.
