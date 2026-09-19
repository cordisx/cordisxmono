# Plugin icon source integration and repository admission — 2026-09-19

This delivery records the user-selected plugin identity artwork in its owning
repositories, its existing source/catalog/site distribution, and the admission
of two previously omitted public repositories. It is an asset and source
integration, not a new nine-plugin runtime compatibility claim or SDK migration.
Source merge, package contents, catalog publication, site deployment, component
verification and native-window acceptance are separate evidence below.

## Repository admission and inventory reconciliation

The official GitHub organization inventory was read on 2026-09-19 through the
maintainer's existing access. It returned 16 canonical repositories, including
Mono and the already registered private roadmap. Game Room and Economy were the
only missing entries. Both are public, non-fork, non-archived repositories with
`main` as default branch:

- [cordisx/plugin-game-room](https://github.com/cordisx/plugin-game-room), mounted
  at `vendors/cordisx/plugin-game-room`, owns the Game Room plugin, game service
  and isolated game execution.
- [cordisx/plugin-economy](https://github.com/cordisx/plugin-economy), mounted at
  `vendors/cordisx/plugin-economy`, owns the Economy plugin, wallet service and
  economy client contracts.

Canonical HTTPS clone URLs are declared in `.gitmodules`; ownership and quality
profiles are in the existing organization table. Both owner `AGENTS.md` files
link the canonical Mono CSS rule. Relevant isolated owner checkout origins were
normalized to their GitHub identities; temporary clones are not extra
repositories. No additional public candidate was excluded or left ambiguous.
Inventory coverage does not certify that inaccessible private repositories do
not exist. The registered private roadmap retains `update = none`.

## Dependency and delivery boundaries

Game Room consumes committed beta.3 Protocol and Host SDK tarballs and a local
Economy release tarball. Economy likewise consumes beta.3 SDK tarballs and
advertises exact beta.3 peers. Admission preserves those owner choices. The
selected Mono Protocol pin is `a692a735e4d596d12ce2ef697f893a747569b102`,
matching the Host's already-published beta.7 dependency; registering the two repositories does not validate their runtime against that
beta.7 provider or the selected Host revision. The plugin maintainers own any
future SDK migration and runtime compatibility checks; a request to upgrade
those dependencies is the review trigger. No SDK migration is part of this
asset delivery.

The Protocol pointer aligns the Host's actual published beta.7 dependency with
its existing canonical source revision. The beta.7 release tag and npm package
`gitHead` both select `a692a735e4d596d12ce2ef697f893a747569b102`; no Protocol
source modification or new Protocol publication is part of this delivery.

The selected source revisions and actual publication evidence follow. No npm
publication or native-window acceptance is inferred from a source merge,
component image check, catalog listing or successful public clone.

## Selected formal revisions

| Owner                    | Commit                                     | Tree                                       | Owner PR                                                        | Gate evidence                                                                    |
| ------------------------ | ------------------------------------------ | ------------------------------------------ | --------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `cordisx-protocol`       | `a692a735e4d596d12ce2ef697f893a747569b102` | `4d62c2194a51c75bd17df58cadefed04efb9c83d` | [PR](https://github.com/cordisx/cordisx-protocol/pull/152)      | [CI](https://github.com/cordisx/cordisx-protocol/actions/runs/35323328610)       |
| `plugin-chatroom`        | `070bc29f651df033975e42bbb2cbd3a44054a60c` | `c37cfb5dc4d5430141ad3e363798f585c865bf3c` | [PR](https://github.com/cordisx/plugin-chatroom/pull/85)        | [CI](https://github.com/cordisx/plugin-chatroom/actions/runs/35447019998)        |
| `plugin-agent-trace`     | `bf2448dd4f5a80180de768c5cd89a8eedfdb6a2e` | `8bf69ffa1672a4f46f526a32f1d118a1acdb30c6` | [PR](https://github.com/cordisx/plugin-agent-trace/pull/11)     | [CI](https://github.com/cordisx/plugin-agent-trace/actions/runs/35446811723)     |
| `plugin-channel`         | `1b6def3a53758e5d2fd93af922d2ed29b2706822` | `66287b4fbba676e6deb43616096db7e1b4747480` | [PR](https://github.com/cordisx/plugin-channel/pull/6)          | [CI](https://github.com/cordisx/plugin-channel/actions/runs/35447079576)         |
| `plugin-cli-proxy-api`   | `12d5daa36dbd5dd565b96d22859afb1d0f3f3e1d` | `a7e6cdc44c3bd08ba33670c133256bc172d941e6` | [PR](https://github.com/cordisx/plugin-cli-proxy-api/pull/6)    | [CI](https://github.com/cordisx/plugin-cli-proxy-api/actions/runs/35446785294)   |
| `plugin-codex-ascension` | `25f5cf7caafd4b43eb1c6df92972e2a409752760` | `2ad10356c8304e5825ab6bb9d1d737930e16d78a` | [PR](https://github.com/cordisx/plugin-codex-ascension/pull/17) | [CI](https://github.com/cordisx/plugin-codex-ascension/actions/runs/35446768900) |
| `plugin-pet`             | `8cbff331ef69f2d62874a93732dfff10d92795ae` | `d6109aec9d9bd9d4dc9b0b0247a72a1558529cc4` | [PR](https://github.com/cordisx/plugin-pet/pull/9)              | Local owner check; see scope below                                               |
| `plugin-game-room`       | `6fa8f010977320e98748c63b5a4f9391ab5a4804` | `2d128264c08e2314282e1e5a52452e1818c3babe` | [PR](https://github.com/cordisx/plugin-game-room/pull/9)        | [CI](https://github.com/cordisx/plugin-game-room/actions/runs/35447010366)       |
| `plugin-economy`         | `bf205c4cad74dfa8323d84eeaded36b7451a1784` | `2206a226e132cc4eaabe708508082172520e040a` | [PR](https://github.com/cordisx/plugin-economy/pull/3)          | [CI](https://github.com/cordisx/plugin-economy/actions/runs/35446811849)         |
| `marketplace`            | `5394d81a7f8177b14c20a38cb2625345a54c328a` | `3c679af97f2734bbe7a26c527a3429357c147266` | [PR](https://github.com/cordisx/marketplace/pull/11)            | [CI](https://github.com/cordisx/marketplace/actions/runs/35447373702)            |
| `cordisx.github.io`      | `6870159f65d02efcfca1da123488e6ab07d57f22` | `dd9afae9a30b481fee6f478d8341dfb480959f08` | [PR](https://github.com/cordisx/cordisx.github.io/pull/11)      | [CI](https://github.com/cordisx/cordisx.github.io/actions/runs/35446815445)      |
| `cordisx`                | `216c8825491224cc38d4a0f8131059cb19029504` | `e1e665f44d02de3e797e12f0dd16584edf2dbc99` | [PR 418](https://github.com/cordisx/cordisx/pull/418)           | [PR full CI](https://github.com/cordisx/cordisx/actions/runs/35447630007)        |

## Owner evidence and publication scope

The integrator fetched each selected canonical main and verified commit
ancestry. Matching main CI was reused for Protocol conformance/distribution,
Chatroom, Agent Trace, Channel, CLI Proxy, Game Room, Economy, Marketplace and
the website; no duplicate full local installation was started. Owner package
checks verified the relevant PNG and module icon bytes. CLI Proxy's existing
optional real-Host test remains skipped (92 pass out of 93); this is not native
window evidence.

Ascension ran its complete plugin check on clean detached
`25f5cf7caafd4b43eb1c6df92972e2a409752760` before and after the command:
typecheck, build and three tests passed. Its main quality/configuration CI also
passed. Pet has no configured CI; its owner supplied successful locked install,
full check (142 tests), real 225-file package inventory and extracted-module
PNG-byte equality evidence on PR head
`6a246f911b9536a3371a36fccec5961da19e623f`. The integrator independently verified
that this head and selected squash merge have the identical Git tree
`d6109aec9d9bd9d4dc9b0b0247a72a1558529cc4`; no exact-merge rerun is claimed.
The verification archive was not published over Pet's existing v0.1.1 release,
which lacks the new artwork. Its Marketplace documentation points users to the
current source rather than inventing an updated installable archive.

Marketplace's main validation, format and shared configuration checks passed.
All nine immutable owner-SHA PNG URLs were publicly retrievable and matched
the user-selected image hashes. The website's exact main check and
[Pages deployment](https://github.com/cordisx/cordisx.github.io/actions/runs/35446814938)
passed; the owner verified deployed JS/CSS against the selected commit and
browser viewport/language/theme and missing-image fallback behavior. These
checks establish catalog and website delivery, separately from plugin package
publication and native-window acceptance.

The coordinator additionally opened the live
[Marketplace page](https://cordisx.github.io/marketplace/) after feed publication.
All nine catalog images reported `complete = true` and intrinsic dimensions
256 by 256; every `src` matched its immutable selected URL. Screenshot review
confirmed the nine selected illustrations. This is live website evidence, not
a native Host window acceptance run.

Game Room's main workflow covers the complete server/container gate. Its
[client, games/agents and Economy integration workflow](https://github.com/cordisx/plugin-game-room/actions/runs/35446894813)
passed on PR head `9208fe43774e7e2fbd25149d2bf3597e0a4ce769`, whose tree exactly
matches the selected merge `2d128264c08e2314282e1e5a52452e1818c3babe`.
That workflow retains Economy `007e310d35674175e2cd411a77f37aa7b21732ed` and
the owner's beta.3 SDK inputs; it is not evidence of a new combined runtime with
all of this record's source pins.

Host PR 418 aligns bundled Channel and CLI Proxy declarations with this
record's exact plugin revisions and prepares beta.9. The corrected PNG test
passed the complete PR gate, including package and integration tests, at
`bcfd6aa1c0b6a5e5d2699fa6313e73e8ba491930`, whose Git tree matches the final
squash merge. The earlier icon-only Host main run failed an obsolete derived-icon
assertion and is not passing release evidence. Host main and beta.9 publication
are tracked independently of the passing source assembly checkpoint.

## Mono validation

The temporary read-only source assembly passed in 1038.78 ms for all 12 selected
repositories. It checked clean exact commits/trees, the Host source entry,
eight plugin source entry hashes, explicit temporary configuration bindings and
a not-running declaration. This is a source identity checkpoint, not a launch
of the beta.3 consumers against beta.7. All nine selected PNG hashes also match
the formal source checkouts, including the retained immutable Slot Showcase
artwork URL from the earlier Host icon commit.

The registration validator's 39 regression tests and the assembly validator's
11 tests passed. Changed-document link review and `git diff --check` passed.
The existing docs, organization-profile and private roadmap gitlinks remain
unchanged. Anonymous retrieval and final Mono CI/readback are recorded at the
final candidate checkpoint.
