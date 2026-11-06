# CordisX beta.50 compatible set — 2026-11-07

This dated integration selects the formal Host beta.50 and Protocol beta.10
source revisions. It records package publication, exact source identity,
scoped native evidence, and user installation as separate results.

## Selected revisions

| Owner            | Formal revision                            | Tree                                       | Treatment                |
| ---------------- | ------------------------------------------ | ------------------------------------------ | ------------------------ |
| Host and Creator | `a6e5eefbd401b0c0294874994acf153a42169ff2` | `a2a559c12507f4faa61a2652fb3dc2cc66f00895` | Host gitlink updated     |
| Protocol         | `8af3d5e38a7b8b5b20e045c706cd1b0f9bbecf0a` | `70be06e09765bc7951bd833becac0a319acd53be` | Protocol gitlink updated |

Host [PR 575](https://github.com/cordisx/cordisx/pull/575) integrates the
provider state-read and native workspace replacement repairs, including the
previously local Desktop build 25241 Manager compatibility changes.
[PR 576](https://github.com/cordisx/cordisx/pull/576) and
[PR 577](https://github.com/cordisx/cordisx/pull/577) complete the browser fixture
and CI toolchain checks. Protocol beta.10 was previously merged and published
through [PR 158](https://github.com/cordisx/cordisx-protocol/pull/158).

Other Mono gitlinks remain at their previously selected formal revisions.
Bundled plugin sources continue to follow the Host's existing `cordisxSources`
record; this delivery does not promote unrelated plugin or site revisions.

## Verification and publication

- The complete Host [PR Check](https://github.com/cordisx/cordisx/actions/runs/42266372631)
  passed all 12 jobs. The final canonical [main Check](https://github.com/cordisx/cordisx/actions/runs/42269020492)
  passed the complete core, renderer, integration, browser, typecheck, native
  helper, package, installed-package, and aggregate gates.
- The exact main Check artifact supplies the immutable release manifest and
  tarballs to the normal [release workflow](https://github.com/cordisx/cordisx/actions/runs/42271584681). Its canonical
  release state reached `DISTRIBUTED`, including clean registry installation
  and generated-project checks for both public packages.
- npm `cordisx@0.1.0-beta.50` and `create-cordisx-plugin@0.1.0-beta.50` report
  the selected Host commit, matching tarball integrity, and provenance. Their
  `beta` tags point to beta.50; `latest` remains `0.0.0`. The immutable Git tag
  `v0.1.0-beta.50` peels to the selected Host commit.
- The existing Protocol [conformance Check](https://github.com/cordisx/cordisx-protocol/actions/runs/42177935007)
  passed at the selected Protocol SHA. Registry readback confirms
  `@cordisx/protocol@0.1.0-beta.10` at that same revision.
- Scoped independent native validation on Desktop build 25241 confirmed
  provider/model menus are enabled, the affected state read settles, Manager
  opens and closes, and all 12 retained native nodes restore without geometry
  drift. Exact product source and retained build inputs match the final Host
  revision; later changes affect tests, CI, and testing documentation.
- The read-only final integration assembly passed in 1596.97 ms with
  exact owner commits, trees, Host entry hash, configuration bindings, and a
  not-running runtime declaration.

## User installation and limits

The published Host beta.50 was installed through the existing global CLI
prefix. Readback verified the version, executable path, all canonical tarball
files, and universal native-helper digests. The active Host remained beta.44;
its process identity, profile, plugin versions and module generations, and
configuration digest were retained. The installed release takes effect on a
fresh normal Host launch after the old Host exits. This integration does not
claim the existing window already loaded beta.50.

The native validation covers menu operability and state refresh, without a new
provider selection or inference request. The internal cause of the original
shared-request waiter and the underlying CI VM page wait remain unconfirmed.
No new deployment or user-interface acceptance is recorded by this Mono update.
