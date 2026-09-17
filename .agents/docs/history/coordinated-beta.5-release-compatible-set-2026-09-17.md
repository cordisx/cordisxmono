# Coordinated beta.5 release compatible set — 2026-09-17

This record closes the public Protocol, Host and Creator beta.5 publication and
selects their exact canonical source revisions. Publication, canonical source,
deployment and runtime acceptance remain separate claims.

## Public packages and canonical source

| Owner    | Published package                    | Registry `gitHead`                         | Selected formal revision                   | Evidence                                                                                                                                                                                                                                |
| -------- | ------------------------------------ | ------------------------------------------ | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Protocol | `@cordisx/protocol@0.1.0-beta.5`     | `bfb49ced50196f98c2aa52d3347b18bd67925427` | `bfb49ced50196f98c2aa52d3347b18bd67925427` | [PR 148](https://github.com/cordisx/cordisx-protocol/pull/148), [tag](https://github.com/cordisx/cordisx-protocol/releases/tag/v0.1.0-beta.5), [release workflow](https://github.com/cordisx/cordisx-protocol/actions/runs/35183103821) |
| Host     | `cordisx@0.1.0-beta.5`               | `25bdc0a5aac80c97f4952f37cbda1e9c64c94cbb` | `25bdc0a5aac80c97f4952f37cbda1e9c64c94cbb` | [PR 411](https://github.com/cordisx/cordisx/pull/411), [tag](https://github.com/cordisx/cordisx/releases/tag/v0.1.0-beta.5), [release workflow](https://github.com/cordisx/cordisx/actions/runs/35184709713)                            |
| Creator  | `create-cordisx-plugin@0.1.0-beta.5` | `25bdc0a5aac80c97f4952f37cbda1e9c64c94cbb` | `25bdc0a5aac80c97f4952f37cbda1e9c64c94cbb` | [PR 411](https://github.com/cordisx/cordisx/pull/411), [tag](https://github.com/cordisx/cordisx/releases/tag/v0.1.0-beta.5), [release workflow](https://github.com/cordisx/cordisx/actions/runs/35184709713)                            |

Both repository tags peel to the selected formal revisions. The official npm
`beta` dist-tag resolves to `0.1.0-beta.5` for all three packages. Protocol's
`latest` remains `0.1.0-beta.3`; Host and Creator retain their existing
`latest` value of `0.0.0`.

## Compatible source set

| Owner                | Formal revision                            | Tree                                       | Integration treatment                                                                   |
| -------------------- | ------------------------------------------ | ------------------------------------------ | --------------------------------------------------------------------------------------- |
| Protocol             | `bfb49ced50196f98c2aa52d3347b18bd67925427` | `210c027e1581c58770393174ce2525218247577e` | updated public gitlink                                                                  |
| Host                 | `25bdc0a5aac80c97f4952f37cbda1e9c64c94cbb` | `8aa2949130d0915e51b55a5774877544186ae871` | updated public gitlink                                                                  |
| Public Marketplace   | `81dabb57654e88e14d63679f025aae9bd7ee0e80` | retained                                   | existing public gitlink; no pointer change                                              |
| Internal Marketplace | `69e15190f47ebf6e031997c7d334f550cf654918` | `fd6cc180418e867689a9672d39f8f5d0cce43f3c` | independently versioned private owner; record only, with no CordisXMono private gitlink |

The internal Aiden and TraeX providers remain independently published stable
packages at `@byted/cordisx-plugin-aiden@0.1.0` and
`@byted/cordisx-plugin-traex@0.1.0`. They were not republished for beta.5.

## Verification and boundary

- Protocol PR 148 passed scope, format, shared-configuration and conformance
  checks. Its successful release workflow published the tagged package from the
  selected canonical main revision.
- Host PR 411 passed scope, shared configuration, changed quality, typecheck,
  core, renderer, integration and browser tests, package checks and the full
  owner gate. Its successful release workflow published Host and Creator from
  the selected canonical main revision.
- Registry readback confirmed the three beta.5 versions, matching `gitHead`
  values, integrity metadata, npm provenance attestations and official `beta`
  dist-tags.
- Internal Marketplace `main` and merged MR 5 were read back independently;
  this release does not change its source or publication state.
- A temporary read-only integration assembly passed in 225.92 ms. It checked
  the exact Protocol and Host commits, trees, source entry hash, explicit
  configuration binding and a not-running runtime declaration before this
  pointer update.

This Mono integration records publication and canonical source identity only.
It does not publish or republish any package, deploy a CDN artifact, update the
retained public Marketplace pin, add a private repository or gitlink, start a
native App or claim a new runtime or user-interface acceptance run.
