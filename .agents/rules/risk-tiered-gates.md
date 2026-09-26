# Risk-tiered delivery gates

Use this rule to choose development, pull-request, release, and Mono integration
checks. It reduces feedback time without changing the evidence required for a
formal release or compatible set. Owner repositories keep their executable
workflows and path mappings; Mono owns this cross-repository policy.

## Measured baseline (2026-09-06)

| Owner    | Current ordinary gate                                                                                                    |                                                          Recent GitHub wall time | Observation                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------: | ---------------------------------------------------------------------------------------- |
| Host     | `npm run check` serializes clean-dev, all typechecks, all builds, 1-worker tests, release, package, and installed checks | 15m31s on main `d3ba961`; a PR run spent 7m38s in `npm run check` before failing | Primary feedback bottleneck; 1,358 tests were recently reported at about 376 seconds     |
| Protocol | Typecheck, release checks, all conformance, then distribution                                                            |                                                            42s on main `9b86aff` | Already inside the fast-loop target; contract changes still require complete conformance |
| Chatroom | Typecheck, build, then all Node tests                                                                                    |                                                          1m40s on main `ca7ac22` | Already inside the fast-loop target; focused selection mainly avoids unrelated failures  |

The durations are workflow wall times, not controlled benchmarks. Dependency
installation and runner variance are included. There is no coverage-percentage
gate. GitHub branch settings did not supply the practical all-green policy:
Host and Protocol main had no required status-check list, and Chatroom main was
unprotected. The release discipline therefore remains explicit in workflows and
review, rather than being misreported as branch-protection enforcement.

## Three gates

1. **Development fast loop (target 2–5 minutes).** Check changed formatting and
   lint, compile affected workspaces or the smallest real dependency closure,
   and run tests related by the repository's standard test runner. A user-led
   pure-style window may keep the visible preview active and run this combined
   gate once when the window closes.
2. **Pull-request affected gate.** Derive scope from the base/head diff. Use the
   repository's workspace graph, test runner dependency analysis, and a small,
   reviewed mapping for global or safety-sensitive paths. Public contract
   changes add complete Protocol conformance and compile the actual Host and
   consumer against the formally merged Protocol revision.
3. **Release and Mono integration gate.** Collect passing evidence for the owner's complete `check`,
   package/distribution checks, required real-runtime validation, and compatible-
   set verification. Preserve Protocol → Host → consumer → Mono ordering and
   canonical `origin/main` pins. A focused PR result never substitutes for this
   gate.

## Change classification

| Change                                                                                        | Pull-request gate                                                                                                             |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Documentation only                                                                            | Changed-file formatting and link/claim review                                                                                 |
| Pure style                                                                                    | Changed formatting/lint, typecheck/build, and related tests once after the preview window                                     |
| Ordinary module                                                                               | Changed formatting/lint, affected workspace compile, related tests                                                            |
| Public contract or export                                                                     | Complete Protocol conformance, distribution, and actual consumer compile/contract smoke                                       |
| Permission, persistent data, lifecycle, native/launcher, or shared test/runtime configuration | Complete checks for the affected trust/runtime boundary plus its required smoke                                               |
| Dependency or lockfile update                                                                 | Inspect the resolved change; run affected consumer checks, adding installation or distribution checks when those paths change |
| Release metadata, packaging behavior, or Mono compatible set                                  | Complete release/integration gate                                                                                             |

Pure-style treatment stops immediately when a change crosses into behavior,
permission, data, protocol, native, or release paths.

The first implementation kept the high-risk path intact: Protocol PR #109 took
41s, Host PR #323 took 13m48s, and Chatroom PR #60 took 1m42s in their complete
owner jobs. For a representative ordinary Host renderer change (`710fe91`), the
new commands measured 8.89s for the CLI dependency-closure typecheck, 9.71s for
the CLI build, and 26.82s for 42 related test files / 340 tests on the same local
machine. Those three jobs run on isolated workers, so their compute phase is
bounded by the longest job rather than their sum; install and runner queue time
remain environment-dependent. This is scoped evidence, not release or live-App
proof.

## Select the test layer

Choose the least expensive layer that detects the concrete regression. Module
logic does not require a browser; browser loading/CSP needs browser evidence;
native integration needs its actual App boundary. Do not make unrelated browser
or native setup a prerequisite for service/plugin development. Describe the
reason in the test or PR, not an additional approval form. Review slow fixtures
for duplicate setup and overlapping coverage before adding more heavy tests.

CI may partition modules and execution environments on independent runners,
reusing prepared artifacts for the same source and environment. Preserve the
complete selected coverage and identify skipped groups; parallel execution is
not permission to omit required evidence. Owner tooling defines the groups and
records durations so later balancing is based on measurements.

## Execution and evidence

- A required check describes evidence, not a requirement to execute both locally
  and in CI. Prefer existing CI for full installation, builds, and regression
  suites. Owner instructions to run `check` before delivery can be satisfied by
  matching CI evidence unless they explicitly require a local environment.
- Before starting a local check, identify the missing evidence or specific
  failure it will resolve. Do not duplicate a running CI job to fill waiting
  time. Run focused local reproduction for failures; leave full reruns to CI.
  Clean-cache installs need an installation/cache-specific reason, not routine
  merge preparation. Stop adding checks once the required evidence is complete.
- Parallelize independent lightweight checks only within available resources.
  On a shared developer machine, run at most one heavy installation or full
  build at a time by default, including its child processes. Separate directories
  or caches do not provide CPU or memory isolation. Recursive Git `prepare`
  builds require inspecting the dependency graph before repeating or expanding
  an install; eventual success alone does not make that workflow affordable.
  Keep shared outputs, fixed ports, and real Desktop interaction serial.
- Track owned subprocess trees and clean up temporary validation processes on
  completion, failure, or cancellation. If execution was interrupted, inspect
  surviving owned processes before resuming. Preserve unrelated apps and previews.
- Reuse a successful result only for the exact commit SHA and gate definition.
  A changed or rebased head recomputes its diff and reruns the affected gate.
  A new SHA does not by itself require a local full suite or checks in unchanged
  repositories; account for changes to consumed dependencies and test inputs.
- Record base SHA, head SHA, classification, selected checks, phase duration,
  and exact-SHA cache hit in the job summary. Do not create a second CI system or
  a custom policy engine.
- Historical full-source lint debt is a scheduled baseline report. It may be
  non-blocking in an owner with recorded debt, while lint errors in changed or
  newly added source remain blocking. A configured shared policy is not a claim
  that full-source lint is green.
- Keep full release/Mono checks and real-runtime validation unchanged. Do not
  add a coverage KPI or use focused evidence as release, live, or user-acceptance
  evidence.

## Failed CI: collect broadly, repair in bounded batches

Use this sequence when any job in a multi-job delivery gate fails. The delivery
owner owns the run-wide failure inventory; an authorized manager routes
independent fixes without changing file ownership.

1. **Inventory the whole run at the first failure.** Record repository,
   head/base, run/job URLs, first failure time, and every job's current state.
   Fetch available failed-job logs immediately; retain running, cancelled, and
   skipped groups as unresolved coverage. Start the known reproduction without
   waiting for every job to finish, and add later failures to the same inventory.
2. **Group failures by evidence and assign each group.** Keep the failing test
   or assertion, raw error, suspected root cause, owner, focused reproduction,
   and status. Distinguish a repeated failure from a newly reached assertion,
   missing coverage, and an infrastructure failure. Do not infer that all red
   jobs share the first diagnosed cause. Within existing delegation authority,
   repair independent groups concurrently with disjoint file boundaries; reuse
   the current owner for incremental fixes.
3. **Preserve useful diagnostic work.** Before pushing a replacement head or
   cancelling a run, check whether concurrency rules will cancel running jobs.
   Preserve available logs and results, and let still-relevant jobs finish when
   practical. Do not cancel healthy groups merely because another group is red.
   Do not wait indefinitely for a hung or invalid run: record the concrete
   reason to supersede it and carry its unobserved coverage into the next gate.
4. **Batch known repairs before another full gate.** Run focused reproductions
   and inspect downstream assertions after an early assertion is repaired.
   Assemble fixes for the known independent blockers, then push one reviewable
   candidate for the required full gate. Do not repeatedly push a single fix
   while other already-reported failures remain unassigned. An earlier push is
   reasonable when it enables otherwise unavailable platform evidence or
   unblocks independent work; record that reason and the remaining inventory.
5. **Close by exact evidence, not a green subset.** Bind final review and checks
   to their actual revision and environment under the evidence rules above.
   Cancelled or skipped required groups are not passing evidence. Preserve
   meaningful assertions, tolerances, and production behavior; a test-oracle or
   loader repair needs a reproduction proving the corrected contract.

For source extraction or loader/configuration changes, include representative
consumers in the focused gate: production asset loading, test-runner imports,
DOM/CSS behavior, and packaging where affected. Text or AST equivalence alone
cannot prove that each environment actually loads those bytes. Verify relevant
platform differences before repeating a full run when a cheap focused
reproduction is available; label simulated platform evidence honestly.

During a retrospective, compare first-failure, diagnosis, assignment, patch-ready,
consumed-handoff, and replacement-run timestamps. Separate elapsed critical-path
time from overlapping owner activity and runner time. A late assignment is a
coordination delay, not a newly discovered failure; overlapping intervals are
not additive savings estimates. Keep this inventory in existing handoff records,
not a new telemetry service or mandatory approval step.

## Small-task handoff

Assign one bounded batch with: owner and exact base SHA; allowed files; risk
class; required focused and full gates; one reviewable artifact; and the exact
handoff destination. Continue an existing task only when its context is still
relevant. Do not repeatedly wake an old high-reasoning task to rerun unchanged
full validation.
