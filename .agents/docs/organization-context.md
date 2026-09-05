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

This is the single repository inventory and ownership table. Other entry points
link here. Repository identifiers are canonical GitHub `org/repo` names;
`.gitmodules` owns mount paths and credential-free canonical clone URLs; Git
gitlinks own exact revisions. Accountable owners below are maintenance roles,
not GitHub permission assignments. Each delivery names its individual/task owner.
The Mono repository is the root and is never mounted inside itself.

| Repository | Visibility | Accountable owner | Authority |
| --- | --- | --- | --- |
| `cordisx/cordisxmono` | public | Mono maintainers | Organization context, repository admission, cross-repository rules, and revision records |
| `cordisx/cordisx` | public | Host maintainers | Host implementation, launcher, Codex adapter, product guides, and implementation architecture |
| `cordisx/cordisx-protocol` | public | Protocol maintainers | Normative, implementation-independent plugin contracts and conformance material |
| `cordisx/docs` | public | Documentation portal maintainers | Documentation navigation, presentation, and publication; its README distinguishes the current portal from planned aggregation |
| `cordisx/cordisx.github.io` | public | Homepage maintainers | Homepage, public-site design system, and showcase capture workflows |
| `cordisx/.github` | public | Organization maintainers | Organization profile and shared community configuration |
| `cordisx/plugin-codex-ascension` | public | Ascension plugin maintainers | Reasoning-intensity presentation plugin and OpenAI Imperium petition site |
| `cordisx/plugin-chatroom` | public | Chatroom plugin maintainers | Chatroom pages, room interactions, and plugin-owned avatar assets |
| `cordisx/plugin-agent-trace` | public | Agent Trace plugin maintainers | Read-only Agent Trace plugin |
| `cordisx/marketplace` | public | Marketplace maintainers | Community plugin catalog and validated discovery feed |
| `cordisx/roadmap` | private | Organization planning maintainers | Provisional strategy, decisions, research, and release planning |

New, transferred, or adopted repositories follow
[repository onboarding](../rules/repository-onboarding.md) in the same delivery.
Initial registration establishes management coverage; its handoff separately
records dependency gaps and compatible-set validation. Registration alone does
not prove that all pinned products work together or have user acceptance.
See the [2026-09-05 inventory audit](history/repository-admission-2026-09-05.md)
for the dated reconciliation; it is not another maintained inventory.

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
