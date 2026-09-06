# Channel and CLI Proxy plugin repository admission — 2026-09-07

This dated record admits two public owner repositories created by extracting
the built-in Channel and CLI Proxy plugin histories from `cordisx/cordisx`.
The maintained inventory is the
[organization ownership table](../organization-context.md#repository-ownership);
this record captures the initial pins and migration gaps only.

## Registered owners

| Repository                     | Visibility | Default branch | Initial formal commit                      | Tree                                       | Quality profile | License             |
| ------------------------------ | ---------- | -------------- | ------------------------------------------ | ------------------------------------------ | --------------- | ------------------- |
| `cordisx/plugin-channel`       | public     | `main`         | `0a8a6035119afd92146c273c1787491d42ffb801` | `b28a713cffa109acab3dbdb0095af6c55fb4eabb` | `typescript`    | `AGPL-3.0-or-later` |
| `cordisx/plugin-cli-proxy-api` | public     | `main`         | `42e113f7d82547fd87c0578c82716dc898c29fd6` | `f539e38ffc7b81151e5f9d2de2227c79aa6e683f` | `typescript`    | `AGPL-3.0-or-later` |

Both repositories use canonical credential-free GitHub URLs, root `AGENTS.md`
owner boundaries, the organization CSS and file-size rules, dprint, ESLint,
Stylelint, and blocking CI. Their retained histories preserve the original Host
authorship. No Host-private implementation was copied into either initial
public tree.

## Migration state and dependency gaps

These initial revisions are deliberately nonfunctional migration scaffolds.
Repository admission does not establish a compatible product set or user
acceptance.

- Channel requires the public Protocol Channel runtime and Manager TypeScript
  entrypoints, followed by one Host implementation over the existing Channel
  authority. The Protocol entrypoints were delivered separately; the Host
  provider and standalone consumer remain migration work at this observation.
- CLI Proxy renderer UI can consume the existing public Platform service. Full
  backend ownership requires a versioned generic platform-provider declaration
  and Host provider loader; the plugin must not retain the Host's private
  service-config, process, secret, or Provider Fleet implementation.
- Host removes `packages/cli/src/plugins/channel` and
  `packages/cli/src/plugins/cli-proxy-api` only after the corresponding owner
  revision is formally merged, packaged through the normal plugin mechanism,
  and consumed from a compatible Host main revision.

The Mono gitlinks in this admission pin the exact scaffold revisions above.
Later functional revisions follow the normal owner-first compatible-set process
and must not be inferred from these initial pins.

## Admission verification

- Remote identity, public visibility, default branch, license, commit, and tree
  were read back from the canonical GitHub repositories.
- Channel corrected its initial license before admission so Host-derived AGPL
  history was not silently relicensed as MIT; its corrected-head CI passed.
- CLI Proxy corrected its initial Host package dependency in a follow-up main
  commit; its corrected-head CI is required before this admission merges.
- The offline registration validator, its regression tests, staged submodule
  diff, link review, and a fresh anonymous recursive public clone/init are the
  remaining Mono admission gates.

No live App, shared preview, deployment, package publication, or user acceptance
is part of this repository admission.
