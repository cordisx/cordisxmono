# Coordinated beta release compatible set — 2026-09-16

This record closes the coordinated Protocol, Host, Creator and internal-provider
plugin publication. Package publication and the final source baseline are
recorded separately because the public repositories received verifier fixes
after the packages were published.

## Public packages and source baseline

| Owner    | Published package                    | Published source (`gitHead`)               | Selected formal revision                   | Evidence                                                                                                                                        |
| -------- | ------------------------------------ | ------------------------------------------ | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Protocol | `@cordisx/protocol@0.1.0-beta.3`     | `a1128348820e8cb95c0980eb998499e6768bf9a8` | `672ea6b36100ec7fe048d8288a2bc17b633b07fe` | [release PR 141](https://github.com/cordisx/cordisx-protocol/pull/141), [verifier PR 142](https://github.com/cordisx/cordisx-protocol/pull/142) |
| Host     | `cordisx@0.1.0-beta.3`               | `ab6bd407e309b1452f0649093807da810933142d` | `c25125edcc1bf1e42b30f83e99569709a2bfaed0` | [release PR 397](https://github.com/cordisx/cordisx/pull/397), [verifier PR 398](https://github.com/cordisx/cordisx/pull/398)                   |
| Creator  | `create-cordisx-plugin@0.1.0-beta.3` | `ab6bd407e309b1452f0649093807da810933142d` | `c25125edcc1bf1e42b30f83e99569709a2bfaed0` | [release PR 397](https://github.com/cordisx/cordisx/pull/397), [verifier PR 398](https://github.com/cordisx/cordisx/pull/398)                   |

The Protocol `beta` and `latest` tags resolve to `0.1.0-beta.3`. Host and Creator
use `beta` for `0.1.0-beta.3`; Host's existing stable `latest` remains `0.0.0`.
The selected formal revisions are the canonical `origin/main` tips after the
registry-verifier corrections. Those corrections did not republish or change
the `gitHead` of the already published beta artifacts.

## Internal packages and policy

| Owner                | Published package                   | Formal source revision                     | Evidence                                                                            |
| -------------------- | ----------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------- |
| Aiden                | `@byted/cordisx-plugin-aiden@0.1.0` | `9b81187dffd3fa0b7403452e94e1e76333e4b7db` | [internal plugins MR 2](https://code.byted.org/fe/cordisx-plugins/merge_requests/2) |
| TraeX                | `@byted/cordisx-plugin-traex@0.1.0` | `9b81187dffd3fa0b7403452e94e1e76333e4b7db` | [internal plugins MR 2](https://code.byted.org/fe/cordisx-plugins/merge_requests/2) |
| Internal Mono policy | not applicable                      | `6d740e04e6ee61b04f7511fb0c2d9f4f4fa9f3e9` | [internal Mono MR 2](https://code.byted.org/fe/cordisx-mono/merge_requests/2)       |

Both internal packages use their independent stable `latest` tag at `0.1.0`.
The internal registry metadata did not expose a package `gitHead`, so this table
records the merged owner revision without claiming it as registry provenance.
The internal Mono policy documents the `@byted/cordisx-plugin-*` naming rule; it
is not a public CordisXMono gitlink.

## Verification and boundary

- Clean registry installs, package integrity and provenance, Host CLI smoke, and
  Creator generation modes passed during the coordinated release.
- The published registry metadata was read back for all five packages. The two
  internal package versions resolve from the ByteDance registry.
- A temporary read-only integration assembly checked the exact final Protocol
  and Host revisions, source entry hashes, explicit configuration bindings and
  a not-running runtime declaration before this pointer update.
- The clean Host and CLI Proxy checkouts did not contain their compiled `dist`
  entries. The local assembly therefore proved source identity only; compiled
  runtime compatibility relies on the owner release evidence above. No plugin
  build, native App, browser session or compiled-runtime smoke was added.
- This Mono change updates only the Protocol and Host gitlinks. It does not
  republish packages, update unrelated submodules, start an App, or claim a new
  user-interface acceptance run.
