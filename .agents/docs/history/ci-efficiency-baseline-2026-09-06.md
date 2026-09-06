# CI efficiency baseline — 2026-09-06

This dated record separates observed workflow times from targets. It is not a
live dashboard, required-check database, or performance guarantee.

## Observed baseline

| Repository / gate                  | Evidence                 |                                              Wall time or first failure |
| ---------------------------------- | ------------------------ | ----------------------------------------------------------------------: |
| Host main full before risk tiers   | main `d3ba961`           |                                                                  15m31s |
| Host high-risk PR after risk tiers | PR #323                  |                                                                  13m48s |
| Host main full after risk tiers    | main `bd4b545`           |                                                                  15m51s |
| Host governance PR                 | PR #324                  |                                    15m37s; normal completion, not stuck |
| Host first actionable failure      | PR #318 failed run       | `npm run check` failed after 7m38s; the known test phase was about 376s |
| Protocol complete                  | PR #109 / main `3d07f2a` |                                                               41s / 42s |
| Chatroom complete                  | PR #60 / main `e731472`  |                                                           1m42s / 1m19s |

No natural ordinary Host PR had yet run the changed typecheck/build/test jobs, so
there is no GitHub wall-time claim for that path. A local representative change
measured 8.89s typecheck, 9.71s build, and 26.82s related tests; this remains
scoped evidence. Do not create a meaningless commit to fill the missing sample.

The first version-1 evidence artifacts were natural high-risk workflow changes:
Protocol PR #110 recorded 32s, Host PR #328 recorded 901s for full and 22s for
changed quality, and Chatroom PR #61 recorded 100s. Each artifact validated
against the closed field set and reported a dependency-cache hit. These samples
prove the evidence path, not the ordinary Host fast-path target.

The existing full-source historical lint report remains on Host main/nightly.
No duplicate formatting or lint job was removed in this delivery because the
active workflows did not prove two jobs executing the same scope on the same
event.

## Report template

Record one natural sample by reference:

```text
CI_EFFICIENCY_SAMPLE
repo: <owner/name>
head/base/gate-version: <exact identity>
classification/environment: <gate class and runner/toolchain>
time-to-first-actionable-failure: <duration or not-applicable>
pr-wall: <duration or not-observed>
main-or-release-wall: <duration or not-observed>
rerun-count: <number and reasons>
duplicate-check-avoided: <number and reused run URLs>
evidence: <GitHub run and small ci-job-result/v1 artifact>
```

Token use and accepted-requirement counts belong in the manager's manual event
summary. CI must not collect ChatGPT account data or establish another telemetry
store.
