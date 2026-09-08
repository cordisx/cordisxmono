# Standalone Channel and CLI Proxy compatible set — 2026-09-08

This integration closes the migration recorded in
[the repository admission](repository-admission-2026-09-07.md). Product code,
renderer styles and Node service adapters now live in their plugin owner
repositories. CordisX Host retains configuration, credentials, process,
permission, broker, Fleet and lifecycle authority.

| Owner         | Formal revision                            | Tree                                       | Merge evidence                                                                                                 |
| ------------- | ------------------------------------------ | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Protocol      | `c2f6f8e4bf4a638bf4627c9c567792f2fedbcfd6` | `dc99ddd7b95cd07e1a11e57ce1af770f9653fcc5` | [PR 130](https://github.com/cordisx/cordisx-protocol/pull/130)                                                 |
| Host          | `826dfcfa7466457522ba00d8ab108a01f29e3b3c` | `7d7a1807215bd1c542fa887b30ebb0d51455b9f7` | [PR 379](https://github.com/cordisx/cordisx/pull/379)                                                          |
| Channel       | `4cee12e3a92eeed557bc9de8cc4792710918327a` | `9a04bfb883f8cf14d680760dcfe34e261dc7553b` | [PR 4](https://github.com/cordisx/plugin-channel/pull/4)                                                       |
| CLI Proxy API | `1428ee205aab31df2779398cc8491879b303d1d0` | `112cca43feea5a7379b7a3a69ee46dbf3975228c` | [PR 3](https://github.com/cordisx/plugin-cli-proxy-api/pull/3)                                                 |
| Agent Trace   | `539da1928bc2dfd113ae90c93f0a115086c96c63` | `61b849b8e2b5822c7ec1b14b37e5f727119d94a6` | [PR 10](https://github.com/cordisx/plugin-agent-trace/pull/10)                                                 |
| Marketplace   | `f302e7f617f87d0fab8bb775b17d7618a3c90e2c` | `b65db52516a23f943b87f05d99673fb5af4d8052` | [PR 9](https://github.com/cordisx/marketplace/pull/9), [PR 10](https://github.com/cordisx/marketplace/pull/10) |

Protocol manifest/package v13 adds Host-materialized exact request scopes for
sensitive Platform calls. The Host validates the actual provider, execution
platform, normalized CWD or Session before prompting, binds dispatch to the
same Provider generation, and runs external provider services through the
single transactional Fleet. Channel and CLI Proxy are resolved from their
normal exact Git packages; the Host no longer contains their renderer or
business adapter copies.

Owner validation included Protocol conformance and distribution checks; both
plugin owner checks; Marketplace schema, ordering and generated-feed checks;
and Host full typecheck/build, 300 test files with 1545 tests, release/package
allowlists and installed tarball consumers. Independent reviews found no
remaining P1, P2 or P3 findings on the final owner candidates.

The first two Host PR 379 full attempts completed tests, release and package
checks but timed out during repeated Git dependency preparation in the
installed-package phase. The final gate verifies the formal Git packages once,
reuses those verified artifacts across all five generated-project shapes, and
completed in 34m39s under the unchanged 40-minute limit.

A temporary integration assembly manifest verifies the exact formal Protocol,
Host and CLI Proxy revisions, built entry hashes, effective configuration and
not-running runtime declaration before this Mono pointer update. This record
establishes source compatibility and discovery registration. It does not claim
npm publication, Official or Certified Marketplace status, a running native
App, or user acceptance.
