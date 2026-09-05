# Repository admission audit — 2026-09-05

Dated observation and registration evidence, not a second live inventory or a
product compatibility claim. The current authority remains the
[ownership table](../organization-context.md#repository-ownership), `.gitmodules`,
and exact gitlinks. Follow the [onboarding rule](../../rules/repository-onboarding.md)
for future admissions.

## Scope and baseline

The authorized scope is Mono repository admission rules and omitted official
repositories. Source manager: `01a0440b-aea5-7092-a0b9-ff9c38a3af8b`; admission
owner: `01a07093-4e4b-7411-83be-8eafcc25fe90`. No remote creation, permission
change, product implementation, existing-pin upgrade, preview operation, or
product acceptance is included. The manager decides the Mono PR merge.

Canonical Mono `main`, fetched and independently read with `ls-remote`:
`0e692ac5facbbed8b1da9c37cdc3ee0bd8aa3a7b`, tree
`92b98bfcf4ecac660edc060f4feeddbfe58c9f8e`. The isolated admission worktree
started clean. Existing shared and dirty checkouts were inspected read-only.

Authenticated, paginated official organization metadata returned 11 repositories
on 2026-09-05. All have default branch `main`, `archived = false`, `fork = false`.
This is inventory visible to the authorized maintainer, not proof about any
inaccessible repositories. Private roadmap contents were not inspected or
initialized; only already-public registration metadata is recorded here.

## Reconciliation

| Canonical repository | Visibility | Baseline result / exact existing pin |
| --- | --- | --- |
| `cordisx/cordisxmono` | public | Root; no self-mount |
| `cordisx/.github` | public | Registered: `831f614b3968f30967f93e6fe2eb07723d9850d4` |
| `cordisx/cordisx` | public | Registered: `7611d876c153093a83ba0378a2bb344638c2ba6f` |
| `cordisx/cordisx-protocol` | public | Registered: `17fa1f3e52ec5d7e65d4bf01bff66f2066c72157` |
| `cordisx/cordisx.github.io` | public | Registered: `8121894f5cf364ce2b215785ed4a39851c58f86e` |
| `cordisx/docs` | public | Registered: `8cc9983248617dda7f075db7d6045a47f300b215` |
| `cordisx/plugin-codex-ascension` | public | Registered: `324993c4c6abd7795a8255c2b498e7ce5fda16d5` |
| `cordisx/roadmap` | private | Registered: `d7221dd4646dd56a0e8c88434021f929902af71a`; `update = none` |
| `cordisx/plugin-chatroom` | public | Missing from all three registration inputs; added in this admission |
| `cordisx/plugin-agent-trace` | public | Missing from all three registration inputs; added in this admission |
| `cordisx/marketplace` | public | Missing from all three registration inputs; added in this admission |

Existing seven gitlinks are preserved. The three added repositories are public
organization-owned products/catalogs with purpose confirmed by their official
metadata and README. Their `package.json` `private: true` flag controls npm
publication, not GitHub repository visibility or Mono initialization policy.

## Added formal revisions

Each clone URL below is also the canonical `.gitmodules` value. The mount is
`vendors/cordisx/<repository>`. Full commit/tree readback and mainline ancestry
were checked in the newly cloned repositories; `git ls-remote` at 08:06 UTC
confirmed these main tips. None has nested `.gitmodules` or mode `160000` entries.
Each selected SHA is also the merge commit of a formal owner PR:
[Chatroom #24](https://github.com/cordisx/plugin-chatroom/pull/24),
[Agent Trace #7](https://github.com/cordisx/plugin-agent-trace/pull/7), and
[Marketplace #3](https://github.com/cordisx/marketplace/pull/3).

| Repository / canonical clone URL | Full formal main commit | Full tree |
| --- | --- | --- |
| `plugin-chatroom` — `https://github.com/cordisx/plugin-chatroom.git` | `fe5f4a2cad5a846f3054837c91d92292a086d4a9` | `8b216f0cef3f5fd09d079bf159fa95a302c0656c` |
| `plugin-agent-trace` — `https://github.com/cordisx/plugin-agent-trace.git` | `c238b868d6f7f37cb2ebf883e2a67c066628f079` | `7e18858f25e291a5ca7a5a53d02cb1f8c6484760` |
| `marketplace` — `https://github.com/cordisx/marketplace.git` | `8454e9c7325e03a38dc42cb14ad6d77de0956b49` | `c2c8bb6822e4ceb7a9353b5aa990670bc38ec496` |

The first Chatroom API observation was `da85341ac78e5322cfc4b3ffce15912114751496`
/ tree `dd44f38d6f332678583d57482548986771fbef73`. Main advanced during this
audit; the actual admission uses the subsequently fetched and read-back
`fe5f4a2cad5a846f3054837c91d92292a086d4a9`, not that older snapshot.

## Dependency facts for the manager

These facts come from the exact admitted public commits, not the latest mutable
owner checkout. They require a separate compatible-set decision; no existing
Host or Protocol gitlink was advanced to conceal the differences.

| Owner source | Declared dependency |
| --- | --- |
| Chatroom `package.json` | Host Git commit `88b98996d70c0ceccaeb423e5329df9abf49d785`; Protocol Git commit `6fa9bbbad0501114bece820d574d5e79a4cb3cdb` |
| Agent Trace `package.json` | npm `cordisx@0.1.0-beta.1`; Protocol Git commit `c96c290697f9e802a68c6d3bb094fd27d8d00d1e` |
| Marketplace `protocol.lock.json` | Protocol Git commit `c81c4fa4819d6e8e2fe976f063f00b213abacc14` |

These differ from Mono's existing Host/Protocol pins above. Builds, contract
conformance, real-App integration, and user acceptance of this combined set are
unverified and outside this registration delivery. Decision owner is the source
manager; review trigger is the next explicitly assigned product integration.

## Local origin cross-check and exclusions

A bounded read-only scan of the Codex worktree root and saved CordisX project
root, depth at most 8, skipped dependency/build directories and did not follow
symlinks. Before these additions it found 145 `.git` roots: 129 readable origins
and 16 stale Git pointers. This is not a whole-machine inventory.

The 129 origins normalize to 17 GitHub identities: 9 CordisX identities and 8
external identities. CordisX checkout counts were Mono 23, Host 28, Protocol 16,
organization configuration 4, site 4, docs 4, Ascension 4, roadmap 1, Trace 1.
Multiple clones/worktrees of one canonical origin do not create new repositories.

Direct omission evidence: an existing `e36a/cordisxmono/vendors/cordisx/plugin-agent-trace`
checkout had canonical origin `https://github.com/CordisX/plugin-agent-trace.git`
and old local HEAD `71a1fde5f45e590c37343668c4e889a256e7e91b`, but its parent
Mono index and HEAD contained no gitlink at that path. A directory alone did not
register the repository. Chatroom and Marketplace were absent from this bounded
local-origin sample; official metadata and canonical clones establish them.

Explicitly excluded external identities: `deepseek-ai/deepseek-harness`,
`nwylzw/shikitor`, `nwylzw/solidloom`, `oneworks-ai/app`, `oneworks-ai/demo-video`,
`oneworks-ai/oneworks-ai.github.io`, `oneworks-ai/shikitor`, and `openai/plugins`.
They are other projects or dependencies, not additional CordisX product mounts.

The 16 unresolved local `.git` pointers returned `not a git repository` and
referenced old Host/Protocol/Ascension metadata. For example, directories named
`cordisx-marketplace-source-ui` and `cordisx-marketplace-source-store` pointed
into `modules/vendors/cordisx/cordisx/worktrees/...`; their names do not establish
Marketplace identity. No metadata repair or new mount was attempted from those
ambiguous local hints. If further identity evidence appears, the Mono maintainer
revisits it at the next inventory audit; they are not evidence of extra official
organization omissions.

No official archived or fork candidates were returned; no additional in-scope
omissions or private admission exceptions were identified. After this admission
the observed organization has one Mono root plus ten registered mounts.

## Reproduce the inventory

```sh
gh api --paginate 'orgs/cordisx/repos?type=all&per_page=100' --jq \
  '.[] | {full_name,clone_url,visibility,default_branch,archived,fork}'
gh api repos/cordisx/plugin-chatroom/commits/main --jq '{sha,tree:.commit.tree.sha}'
gh api repos/cordisx/plugin-agent-trace/commits/main --jq '{sha,tree:.commit.tree.sha}'
gh api repos/cordisx/marketplace/commits/main --jq '{sha,tree:.commit.tree.sha}'
git config --file .gitmodules --get-regexp '^submodule\..*\.(path|url|update)$'
git ls-tree -r HEAD
```

Remote main results are time-specific. Future audits must fetch/read back again;
they must not replace this historical observation or assume it is current.

## File-size policy coordination

The concurrent file-size guard owner (`01a07013-07b3-7323-95b8-3ef72a3a1b3c`)
reported that its proposed recursive check treats a new mount as having an empty
base. A repository's pre-existing large files therefore need an explicit
admission decision; using the new pin as its own baseline would bypass that
check. No baseline substitution, blanket exemption, or product refactor was made
in this registration change. New-owner workflow callers remain with the file-size
governance workstream; the manager explicitly assigned the three owner callers
and rule routing to that owner. Only formal merged owner revisions may later be
consumed; their pending work does not change this admission's frozen pins.

The following complete list was read from exact tracked Git blobs at the three
admitted commits above. Count non-NUL UTF-8 text lines, including an unterminated
last line. Chatroom had 108 text blobs, Trace 30, Marketplace 22. There were no
over-limit documentation files. Lockfile labels below describe generation, not
an approved exception.

| Repository | Path | Lines | Exact blob SHA | Kind |
| --- | --- | ---: | --- | --- |
| Chatroom | `package-lock.json` | 4930 | `a1d18848a3a900286616f7de117f39abaf5ec76c` | Generated lockfile; no admission exemption |
| Chatroom | `src/agent-loop-controller.ts` | 1631 | `4538d9b3495ec201bcd0c6942519a8f1452104b9` | Source |
| Chatroom | `src/agent-session-controller.ts` | 1661 | `af209573039fa80d5fd4ca3c96a0e83bf03289b3` | Source |
| Chatroom | `src/conversation-source.ts` | 1656 | `11eedf1144656fd877c56e5eec35dd20ac372267` | Source |
| Chatroom | `src/playground-room-simulation-bridge.ts` | 1589 | `7babb75d1bb69b7a8dc05424662f7afd9190fa3b` | Source |
| Chatroom | `src/room.ts` | 1782 | `19131333989b4a7172f4a4e8221dee7447a55f77` | Source |
| Chatroom | `test/agent-loop-controller.mjs` | 1369 | `97256bb9a020cdb59e17945387d8af301868c406` | Test |
| Chatroom | `test/agent-session-controller.mjs` | 2159 | `84ba6d00b455fa0e53b760e3da73539ef47d2a51` | Test |
| Chatroom | `test/room-engagement.mjs` | 1038 | `42bf7be3de9d583a6a7d5f4d6a3722285d2a8bcb` | Test |
| Agent Trace | `package-lock.json` | 5071 | `2ee5675c871dfc9bcf6d3257e16571716639aae6` | Generated lockfile; no admission exemption |

Marketplace has no text blob over 1000 lines. For Chatroom, eight handwritten
source/test files remain historical debt; the two generated lockfiles need the
guard's reviewed exact-path policy. Decision owner is the source manager with
the file-size guard owner. Review trigger is before merging both governance
changes or enabling recursive admission enforcement. Options are an explicitly
reviewed migration policy or separately assigned owner cleanup; this admission
owner is not authorized to silently refactor products or waive the guard.

The proposed migration option (not approved or implemented here) is a reviewed
first-admission baseline bound to a formal owner commit/tree and these exact
eight handwritten paths, blobs, and line ceilings. Unlisted/new/renamed files
would keep the normal strict limit. Future owner PRs and Mono pin updates would
use their real previous revisions, with no growth of historical oversized
files; each migration entry would be removed after the file drops to the limit.
The generated lockfiles require separate reviewed exact-path classification.
The alternative requires product owners to split at least five source modules
and three test suites, validate the affected controllers/Room/simulation paths,
and formally merge before admission. That product cleanup is outside this task.
