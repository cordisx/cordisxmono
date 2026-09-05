# CordisX Organization Context

CordisXMono coordinates independently versioned CordisX repositories. Open
organization work at this checkout, make changes in the owning repository, and
record compatible revisions through exact submodule commits. Product code and
product documentation remain with their owners.

## Workspace model

- The saved project checkout and Codex worktrees are valid Mono roots; discover
  the current path from Git rather than assuming one user's home directory.
- Repository mounts are `vendors/cordisx/<repo>`.
- Public clones initialize public submodules; private `roadmap` uses
  `update = none` and requires an authorized opt-in.
- Read the root `AGENTS.md`, then the owning repository's instructions before
  editing. Its nested rules govern that repository.

See [getting started](getting-started.md) for synchronization and owner branches.

## Repository ownership

This is the organization ownership table. Other entry points link here.
`.gitmodules` owns mount paths and clone URLs; Git gitlinks own exact revisions.

| Repository | Visibility | Authority |
| --- | --- | --- |
| `cordisxmono` | public | Organization context, cross-repository rules, and compatible revision records |
| `cordisx` | public | Host implementation, launcher, Codex adapter, product guides, and implementation architecture |
| `cordisx-protocol` | public | Normative, implementation-independent plugin contracts and conformance material |
| `docs` | public | Documentation navigation, presentation, and publication; its README distinguishes the current portal from planned aggregation |
| `cordisx.github.io` | public | Homepage, public-site design system, and showcase capture workflows |
| `.github` | public | Organization profile and shared community configuration |
| `plugin-codex-ascension` | public | Reasoning-intensity presentation plugin and OpenAI Imperium petition site |
| `roadmap` | private | Provisional strategy, decisions, research, and release planning |

Promote settled implementation decisions to Host, settled public contracts to
Protocol, and publishable guidance to the relevant product owner. Keep a link to
the promoted fact instead of maintaining parallel copies in roadmap or Mono.

## Product and architecture references

CordisX is an unofficial, opt-in local extension host for Codex Desktop. Its
organization boundary keeps public contracts separate from Host implementation
and plugin product behavior. The Host owns native integration and the UI
surfaces exposed by its public contracts; plugins consume those contracts.

Read the owning sources for current APIs, launch behavior, capabilities,
security limits, and implementation status:

- [Host documentation](../../vendors/cordisx/cordisx/.agents/docs/README.md)
  and [architecture](../../vendors/cordisx/cordisx/.agents/docs/architecture.md).
- [Protocol specifications](../../vendors/cordisx/cordisx-protocol/.agents/docs/README.md)
  and [Protocol maintenance rules](../../vendors/cordisx/cordisx-protocol/.agents/rules/README.md).
- [Documentation portal](../../vendors/cordisx/docs/README.md) and
  [public-site design system](../../vendors/cordisx/cordisx.github.io/.agents/docs/site-design-system.md).

These local links follow the checked-out revisions. A checked-out feature branch
or dirty tree is not a formally integrated baseline. Do not infer current
capabilities from the [2026-08-23 historical baseline](history/organization-baseline-2026-08-23.md).

## Cross-repository work

Follow [cross-repository changes](../rules/cross-repo-changes.md) for formal owner
handoffs, compatible-set verification, and final Mono gitlinks. Read
[protocol synchronization](../rules/protocol-sync.md) for public contract work
and [documentation ownership and layers](../rules/documentation.md) for prose.

At the start of organization work, inspect dirty state, fetch relevant remotes,
and distinguish Mono's pinned set from owner main tips. Report implementation,
validation scope, merge, publication, and user acceptance separately.

Responsible manager mode applies only to an explicit ongoing coordination
assignment; its trigger is in the [workspace rules](../rules/README.md).
