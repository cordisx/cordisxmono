# Marketplace v6 compatible set — 2026-09-17

This integration records the formally merged Marketplace v6 contract, Host
consumer and private internal catalog owner. It updates only public Mono
revisions owned by this compatible set; the private catalog remains an
independently versioned owner and is not a CordisXMono submodule.

| Owner                | Formal revision                            | Tree                                       | Merge evidence                                                                  |
| -------------------- | ------------------------------------------ | ------------------------------------------ | ------------------------------------------------------------------------------- |
| Protocol             | `51c38f7fdfe1746b029566eebb925d1a76216016` | `26078b89c8a7471518057ce287bba26873724cca` | [PR 147](https://github.com/cordisx/cordisx-protocol/pull/147)                  |
| Host                 | `ab3520d4cd7e76a1bb15f8a3831a99559dc4df8a` | `38af5a2514bc04e1ed9ee06640585c215690f5aa` | [PR 410](https://github.com/cordisx/cordisx/pull/410)                           |
| Internal Marketplace | `69e15190f47ebf6e031997c7d334f550cf654918` | `fd6cc180418e867689a9672d39f8f5d0cce43f3c` | [MR 5](https://code.byted.org/fe/cordisx-marketplace/merge_requests/5)          |
| Public Marketplace   | `81dabb57654e88e14d63679f025aae9bd7ee0e80` | retained                                   | [PR 6](https://github.com/cordisx/marketplace/pull/6); no pointer change needed |

Protocol v6 permits bounded canonical PNG data-image icons while rejecting SVG
and noncanonical inline forms. Host consumes v6 feeds, keeps local HTTP source
discovery separate from HTTPS trust roots, verifies catalog package artifacts
before lifecycle and permission review, and exposes install, update, cancel and
packaged README flows. The internal catalog embeds its published Aiden and TraeX
PNG icons, generates only the feed artifact and locks its vendored schemas to
the Protocol revision above.

## Verification

- Protocol PR 147 passed configuration, conformance, formatting and scope
  checks at the selected canonical main revision.
- Host PR 410 passed changed quality, typecheck, core, renderer, integration and
  browser tests, package checks and the full owner gate. Its native HMR preview
  was accepted. The PR records a pre-existing exit-order cleanup warning after
  the test App had already exited; the Marketplace implementation does not own
  that interception cleanup.
- Internal Marketplace MR 5 passed 32 focused catalog and CDN tests, a CDN build
  and verification at `5d983e849ecf`, a Host parser fixture and its full 50-test
  check. Its main-branch `protocol.lock.json` names the selected Protocol commit
  and v6 schema hashes.
- A temporary read-only integration assembly passed in 303.31 ms. It checked
  exact canonical commits, trees, source entry hashes, explicit configuration
  bindings and a not-running runtime declaration for Protocol, Host and the
  private catalog checkout.

The selected Protocol and Host revisions include intervening canonical mainline
work beyond Marketplace v6. This record claims compatibility only for the
Marketplace scope and the evidence listed above. It does not publish an npm
package, deploy a CDN artifact, add a private gitlink, update the retained public
Marketplace pin, start a native App or claim a new acceptance run beyond the
owner preview.
