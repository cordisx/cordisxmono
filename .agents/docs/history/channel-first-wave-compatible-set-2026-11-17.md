# Channel first-wave compatible set — 2026-11-17

This integration records the first-wave Channel message, permission, and task
settings release. It keeps the subsequent remote-history and headless CLI work
outside this particular baseline.

## Selected revisions

| Owner            | Formal revision                            | Tree                                       |
| ---------------- | ------------------------------------------ | ------------------------------------------ |
| Host and Creator | `0fcf10b909dae83421acede2409a93428f0467a8` | `fef93e31144be51aee9d1ae8163bc2b33582b501` |
| Protocol         | `e497be9a3f001323deac481abccbf0e9f0924b46` | `38db221741f9d6ed7225121d2ae4423940b316fc` |
| Channel          | `5afcc0a3c5be1045b0fbb9a4a6cd9117b88c2e65` | `f40fff0a052a935b7b09829485900ea7bf5432e7` |
| Marketplace      | `013c1542857651c6ceaacef0f2e70b100869f2d3` | `69207ba6c12c1aef420d80c0d70c5e5cc19b2a05` |

All four revisions were read back from their owners' canonical main histories.
The Host bundles the exact Channel revision above. Marketplace points to
Channel 0.1.3 and requires Host `>=0.1.0-beta.66 <0.2.0`.

## Verification

- The [Host main Check](https://github.com/cordisx/cordisx/actions/runs/43961590128)
  passed the complete test, native helper, package, and installed-package gates
  at the selected Host commit.
- Registry readback for `cordisx@0.1.0-beta.67` and
  `create-cordisx-plugin@0.1.0-beta.67` matched that commit and the exact main
  Check candidate archives. The [release workflow](https://github.com/cordisx/cordisx/actions/runs/43961694809)
  completed, including a clean registry installation. The Host archive SHA-256 is
  `64be73ab9db90fd85585388ec76447502de26f81f36081d298c53c87342dcb21`;
  its npm SHA-1 is `813768810515ec350671298bda3880f7d1c2c412`.
- The [Protocol main Check](https://github.com/cordisx/cordisx-protocol/actions/runs/43934990648)
  passed at the selected commit. Its separate Quality workflow initially hit a
  registry connection reset; [attempt 2](https://github.com/cordisx/cordisx-protocol/actions/runs/43934990747)
  passed. The Protocol beta.14 [release](https://github.com/cordisx/cordisx-protocol/actions/runs/43935049034)
  passed on its second attempt after a registry visibility delay.
- The [Channel 0.1.3 release](https://github.com/cordisx/plugin-channel/releases/tag/v0.1.3)
  is tagged at the selected commit. Its downloaded archive matched the
  published SHA-256 `c0e4d191676a3c9e7d33d295e253577b59c123e00fd619bd24202a37688634b7`.
  Marketplace's catalog entry was read back with the same digest.
- The read-only integration assembly passed against the exact Host, Protocol,
  and Channel commits and their trees. The Host entry came from the main Check
  release-candidate archive, and the Channel entry matched the downloaded
  Channel release archive. The assembly used explicitly synthetic configuration
  and a not-running port; it did not test or alter the active application.

The existing application and persisted data were not switched by this assembly.
This checkpoint does not claim live Feishu acceptance or that an existing
application window has loaded the selected release.
