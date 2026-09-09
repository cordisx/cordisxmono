# Notification candidate set — 2026-09-10

This is a feature-branch compatibility record, not a formal compatible-set
admission, merge, release, or Mono pointer update. All changed owners use
`codex/unified-notifications`. Product behavior and authoring rules are owned by
the [Host notification guide](https://github.com/cordisx/cordisx/blob/34d7457ade01dc414662b3cdd9f9d25c3c1b81cd/.agents/docs/notifications.md)
and the [Protocol contract](https://github.com/cordisx/cordisx-protocol/blob/dfa2c5fa956184df11a97955b8e5c74a76cb8876/.agents/docs/notifications-v1.md).

| Owner     | Candidate revision                                                                                                |
| --------- | ----------------------------------------------------------------------------------------------------------------- |
| Protocol  | [`dfa2c5fa9561`](https://github.com/cordisx/cordisx-protocol/commit/dfa2c5fa956184df11a97955b8e5c74a76cb8876)     |
| Host      | [`34d7457ade01`](https://github.com/cordisx/cordisx/commit/34d7457ade01dc414662b3cdd9f9d25c3c1b81cd)              |
| Channel   | [`189bab14eaf6`](https://github.com/cordisx/plugin-channel/commit/189bab14eaf62e5b1f2eee3cd37e2dacfbacc3ff)       |
| Chatroom  | [`9578db10cae2`](https://github.com/cordisx/plugin-chatroom/commit/9578db10cae2d4a735838aef1f5c4641443bc064)      |
| CLIProxy  | [`c059122f783a`](https://github.com/cordisx/plugin-cli-proxy-api/commit/c059122f783a2bf5ab3469319a3686949ffb2862) |
| Pet       | [`8bfe2ac1be77`](https://github.com/cordisx/plugin-pet/commit/8bfe2ac1be77d85cfabe902ace388de169688ae2)           |
| Game Room | [`2acf509663b9`](https://github.com/cordisx/plugin-game-room/commit/2acf509663b95a8506965eb1961dd5cc7aff764e)     |
| Economy   | [`9c916d3d452f`](https://github.com/cordisx/plugin-economy/commit/9c916d3d452f25f2d66f0c791c939a5c75f90749)       |

The consumer build SDK is Host `efbff656d84b482d51598bc5ba303d24134e0c62`;
its canonical shared Protocol dependency is
`f3e18c925c34d90fdf203c158811cef10f7ebf57`. The later Protocol candidate only
clarifies coalescing prose. Later Host fixes cover synchronous root installation,
test teardown, demo metadata and packaged API verification, preserving that public
consumer interface. Each consumer owns an evidence JSON with artifact hashes and
a guide to rebuilding the ignored local SDK archive from the exact Host source.

Detailed Host evidence is retained in the dated
[delivery record](https://github.com/cordisx/cordisx/blob/34d7457ade01dc414662b3cdd9f9d25c3c1b81cd/.agents/docs/notification-delivery-2026-09-10.md).

## Validation scope

- Protocol `npm run check` passed. The separate merge-time distribution gate
  subsequently exposed a missing notification export inventory; it was fixed
  and verified in Protocol PR 137.
- All six migrated consumer packages passed their owner checks. Chatroom's
  additional full-source lint and formatter checks passed. Game Room's client
  check retains its existing one optional skipped test; no server/real-agent
  behavior is inferred from the UI migration.
- Host typecheck/build, source lint (existing warnings only), release metadata
  and package allowlists passed. A full test run passed 1,747 tests and exposed
  three demo metadata failures plus React test-environment teardown errors.
  After correction, all 28 tests in the affected five files passed without
  unhandled errors. Fresh installed-package verification also passed, including
  public notification consumer types and generated-project layouts.
- Isolated native `app://-/index.html` demo verified source image/navigation,
  details/retry failure, mute/undo, persistent rule management/restore, narrow
  viewport, short-card menu bounds/Escape, queue bounds and renderer disposal.
  The runner verified closed CDP port and zero remaining profile processes.
  This exercises the real Host API using synthetic notices; it does not claim
  live business failures in six independent backends.
- Agent Trace was inspected: its retained inline state describes the current
  Session projection. Ascension's Host plugin has no custom operation Toast;
  reset status in its separate Next.js application is outside the Host API.
- The maintained plugin-authoring Skill, generated-project README, consumer
  AGENTS entry points and owner guides route future work to the public API.

Game Room and Economy were edited in isolated worktrees of their owning
repositories. Their active tasks and the running user's Host were not replaced.
Neither is newly admitted to Mono by this record. Formal merge, repository
admission where applicable, and compatible-set assembly remain separate work.
