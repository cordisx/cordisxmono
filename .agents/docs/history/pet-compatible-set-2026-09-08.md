# Pet compatible set — 2026-09-08

The pet implementation task owns this integration. The user selected the shop issue, multi-entity Composer companions and care/idle behavior for development, and authorized related owner merges. Product requirements and behavior remain in [pet issue 1](https://github.com/cordisx/plugin-pet/issues/1) and the [pet guide](https://github.com/cordisx/plugin-pet/blob/main/docs/pet-system.md).

| Owner    | Formal revision                            | Merge evidence                                                                                               |
| -------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Protocol | `5d38948025c2ac48e0b184a9d63c5bf595c762d8` | [PR 129](https://github.com/cordisx/cordisx-protocol/pull/129)                                               |
| Host     | `82865d8f6e8437cd3ca74cdd6fb82bfe8f38a741` | [PR 375](https://github.com/cordisx/cordisx/pull/375), [PR 377](https://github.com/cordisx/cordisx/pull/377) |
| pet      | `7e7bb4ea13b8648f5e681b329f1b46dd20fc025e` | [PR 5](https://github.com/cordisx/plugin-pet/pull/5)                                                         |

These revisions replace the older provider pins whose compatibility was explicitly outside the [initial pet admission](repository-admission-pet-2026-09-08.md). Other product gitlinks remain at their previous revisions; this record does not claim new runtime acceptance for those consumers.

Validation covers Protocol gates; Host complete owner CI, strict compilation, package and installed-package checks; and the pet complete check with 83 passing tests, production graph and declaration/package binding. Additional Host regression tests cover bounded usage scanning, large real metadata headers, Manager navigation and permission recovery. Exact temporary assembly manifests verified code, entry hashes and configuration before isolated same-port switches.

Native `app://` verification covered two companions, selected primary pet, outfit persistence, flat rendering, drag/fall/rest, right-click navigation from a closed Manager, and usage denial/recovery. Real local usage credited the wallet, purchasing debited 5 coins, and feeding consumed one item and increased fullness from 75 to 95. After renderer reload, earned coins matched the validated aggregate exactly and purchase/feeding records persisted. No synthetic coins or live ledger changes were used. This is developer verification, not a claim of final user acceptance.

This integration records source compatibility. It does not publish a new npm package or change the existing GitHub release and marketplace artifact. Source/release distinctions remain in the owner README.
