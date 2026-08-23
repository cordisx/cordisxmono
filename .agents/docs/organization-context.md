# CordisX Organization Context

This repository is the single working context for the `cordisx` GitHub
organization. Open Codex tasks at the CordisXMono root and make changes in the
submodule that owns the material. CordisXMono coordinates compatible revisions;
it does not own product code or duplicate submodule documentation.

## Workspace model

- Local namespace: `~/codes/cordisx/cordisxmono`
- Codex project root: the CordisXMono checkout only
- Repository mounts: `vendors/cordisx/<repo>`
- Private planning: `vendors/cordisx/roadmap`, registered with `update = none`
- Public clones: initialize public submodules recursively and skip `roadmap`
- Authorized maintainer workspaces: opt into `roadmap` with the command in
  `getting-started.md`

Read the root `AGENTS.md` first. Before changing a mounted repository, read its
own `AGENTS.md` and `.agents/rules`. Nested instructions are authoritative for
that repository.

## Repository ownership

| Repository | Visibility | Authority |
| --- | --- | --- |
| `cordisxmono` | public | Organization context, pinned revisions, and cross-repository coordination |
| `cordisx` | public | Host implementation, launcher, Codex adapter, tests, and public architecture |
| `cordisx-protocol` | public | Normative, implementation-independent plugin contracts and conformance material |
| `docs` | public | Aggregated public documentation and publishing |
| `cordisx.github.io` | public | Organization homepage |
| `marketplace` | public | Community plugin catalog entries, generated discovery feed, and contribution CI |
| `.github` | public | Organization profile and shared GitHub templates |
| `roadmap` | private | Provisional strategy, decisions, research, and release planning |

Settled implementation decisions move to `cordisx`; settled public contracts
move to `cordisx-protocol`; publishable documentation moves to the relevant
public repository. Do not leave an approved fact only in `roadmap`.

## Product and architecture baseline

CordisX is an unofficial, opt-in local UI plugin host for Codex Desktop. It
combines a CodexPlusPlus-style launcher and loopback CDP injection with
DeepSeek Harness-style Cordis fibers, services, effects, and named UI slots.
It does not modify the installed Codex application, replace the agent loop, or
relay authentication.

The plugin API intentionally follows DSH rather than inventing a parallel
facade:

- plugins declare `inject = ['slots']`;
- hosts declare a slot with `ctx.slots.inject(name, setup)`;
- plugins contribute with `ctx.slots.register(options, component)`;
- the caller's Cordis fiber owns cleanup and removal;
- there is no `ctx.cordisx.contribute()` API.

The first five semantic slots are `header.actions`, `composer.before`,
`composer.after`, `sidebar.footer`, and `shell.overlay`. The host adapter owns
Codex DOM selectors; plugins target semantic names. Version 0.1 supports list
entry identity, order, priority shadowing, declaration injection, fiber-owned
disposal, and remounting after anchor replacement. Keyed, chain, children,
store, locale, and business-face injection remain deferred.

The default launcher starts a second Codex instance with a stable project-scoped
Chromium profile and an ephemeral loopback CDP port. Codex processes, AppServer
stdio/lifecycle, Chromium data, CDP, UI storage, and window restoration are
isolated. `HOME` and `CODEX_HOME` remain shared so authentication, conversations,
projects, and model configuration remain available. `--system` is the escape
hatch to the user's normal profile. `--online-devtools` explicitly grants the
official Chrome DevTools frontend full debugging authority over the isolated
renderer.

Plugins currently execute as trusted renderer code. Cordis provides lifecycle
composition, not a security sandbox. Do not claim marketplace safety before
execution isolation, enforced capabilities, source identity, signing, atomic
activation, and rollback exist.

## Marketplace discovery architecture

The first marketplace stage is a public discovery catalog, not an installer or
trust authority. Its dependency and ownership chain is:

1. `cordisx-protocol` owns versioned marketplace-entry and marketplace-feed
   JSON Schemas, canonical identity rules, downgrade behavior, and conformance
   fixtures.
2. `marketplace` accepts one plugin JSON entry per pull request, validates every
   entry and cross-entry identity in CI, and deterministically generates the
   public aggregate feed.
3. `cordisx.github.io` owns a public read-only marketplace page that fetches the
   generated feed rather than duplicating catalog data.
4. `cordisx` owns manager UI for browsing feeds and configuring multiple feed
   URLs. Catalog browsing must remain independently usable from plugin runtime
   activation.
5. CordisXMono records the compatible protocol, catalog, site, and host commits
   only after every owning repository commit is pushed and tested together.

A plugin's cross-catalog identity is the tuple of its canonical plugin `source`
URL and lowercase plugin `id`. The configured marketplace-feed URL records
catalog provenance but is not plugin identity. When the same identity appears
in multiple configured feeds, the earliest configured feed wins and later
copies are reported as duplicates rather than merged field-by-field.

The initial manager stores the ordered feed URL list in the current Chromium
profile. It may fetch, validate, search, deduplicate, and link to catalog
entries. It must not claim install, update, signature verification, capability
enforcement, immutable activation, or rollback until the later authority and
distribution stage implements those behaviors.

The cross-repository PR boundaries are protocol/schema first, then catalog and
CI, then the public page, then the CordisX consumer UI, and finally one mono
coordination commit. Scoped validation covers schema fixtures, deterministic
feed generation, CI-equivalent catalog checks, page fetch/error rendering,
multi-source deduplication, manager source persistence, and an isolated live UI
smoke. Package execution and security-enforcement tests remain out of scope.

## Delivery order

1. Harden Codex version discovery, adapter fixtures, live read-only probes, and
   safe diagnostics.
2. Add generation-based reload, a manager UI, manifests, dependency display,
   compatibility declarations, marketplace discovery/configuration, and state
   handoff.
3. Define and enforce versioned capabilities, isolate untrusted execution, add
   signed immutable packages, staged activation, and rollback.
4. Bridge portable task UI to official MCP UI while keeping optional CordisX
   shell augmentation independently usable.

Externally observable contract changes land in `cordisx-protocol` before or
alongside compatible `cordisx` changes. Push each owning repository first, test
the compatible set, and update CordisXMono pointers last.

## Verified organization baseline

Baseline captured on 2026-08-23:

- GitHub organization: `CordisX`
- Description: `A Cordis-powered UI plugin ecosystem for Codex Desktop.`
- Homepage: `https://cordisx.github.io/`
- Default repository permission: none
- Member repository creation: disabled
- `core` team: maintain access to every organization repository
- `security` team: triage access to every organization repository
- Merge policy: squash and rebase are enabled, merge commits are disabled, and
  merged branches are deleted
- Public `main` branches reject force pushes and deletion
- GitHub Pages: homepage and documentation deployments are built and return 200
- GitHub Actions: enabled for all organization repositories and actions

Pinned revisions in this compatible marketplace coordination branch:

| Repository | Commit |
| --- | --- |
| `.github` | `cefd66a2ee87df4807c7c143e2031fea9ffe220f` |
| `cordisx` | `3b536fb6585cbf59c0ab08bf4d7e7cec852359ad` |
| `cordisx-protocol` | `f3e4eaceaa3c7caf27874f8a7ad0f655dd754b33` |
| `cordisx.github.io` | `f5a874a1bfc5f630e034b00e05b76a985981ff81` |
| `docs` | `50905086f409b6de6c4753086e40e44204f9afa3` |
| `marketplace` | `34b6c1bf4a0f5a3010aa6f13e5b7e50ece848b76` |
| `roadmap` | `d7221dd4646dd56a0e8c88434021f929902af71a` |

The implementation baseline has TypeScript/configuration/DOM lifecycle tests,
an isolated-launch path, real renderer injection evidence, and five DSH-aligned
slots. Treat that as a feasibility baseline, not as proof of compatibility with
future Codex releases.

## Task handoff checklist

At the beginning of every organization-level Codex task:

1. Read this file, the root rules, and the owning repository's nested rules.
2. Fetch the CordisXMono remote and compare every relevant submodule pointer
   before calling the checkout current.
3. State whether findings are implemented, live-verified, experimental,
   blocked, or planned.
4. Record architecture and dependency order before cross-repository
   implementation.
5. Validate in the owning repository, push it, then update and verify the mono
   pointer in a separate commit.
