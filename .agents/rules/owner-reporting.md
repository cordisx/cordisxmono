# Owner Reporting Protocol

Use this protocol whenever a responsible manager coordinates two or more Codex
tasks. Task owners actively report material events to the manager's source task.
Active reports are the primary source of task state. The manager may use bounded
event waits and evidence checks, but must not replace owner reporting with
repeated polling or depend on the user noticing that a task has finished.

## Dispatch requirements

Every owner delegation must include:

- the manager source task ID;
- the event types below;
- the required report fields;
- an instruction to continue remaining authorized work after reporting unless
  a decision or real blocker requires a pause, or the delegated scope is complete.
- an explicit model/reasoning choice and the manager source task for replies.

The owner sends one `ACK` at task start. Reused tasks do not repeat it unless a
compact handoff starts a semantically new stage.

## Events that require immediate reporting

- `ACK`: one acknowledgement of the compact packet and its stop condition;
- `DECISION_REQUIRED`: product, scope, authority, or destructive-action choice;
- `FAILED`: a terminal failure or failed delegated deliverable, with evidence;
- `BLOCKED`: a concrete dependency or external condition prevents progress;
- `NEED_API` or `API_READY`: a cross-owner contract request or immutable handoff;
- `CHECKPOINT_READY`: a clean committed local checkpoint exists;
- `PREVIEW_READY`, `FEEDBACK_READY`, or `INTEGRATION_FAIL`: a review surface is
  ready, updated feedback is visible, or integration failed materially;
- `PR_READY` or `MERGED`: remote delivery state changed;
- `FINAL_REPORT`: delegated scope is complete, including a local-only deliverable.

Send completion, failure, and decision events proactively; do not wait for a
manager prompt. A recoverable local check failure that the owner is actively
fixing does not by itself require `FAILED`. Ordinary progress, unchanged state,
waiting, timeout, and `cleanup_pending` stay silent.

Reuse successful evidence for the same repository SHA, inputs, environment, and
check version by reference. Do not paste its old output or rerun it merely to
produce another status event. A changed SHA or invalidated dependency reruns
only the affected evidence required by the applicable gate.

For GitHub checks, the reusable identity is repository, head, base, gate
version, classification, and environment. Cite the successful run and its
`cordisx/ci-job-result/v1` artifact. Evidence from another source or environment
is not interchangeable even when the commit SHA matches.

After `FINAL_REPORT`, end the owner turn when its delegated scope is complete
and no authorized work remains. Report any handoff obligations before ending;
do not invent further work to satisfy the continuation instruction.

## Required report payload

Lead with a short result or blocker and the next action. Reports must identify:

```text
task: <owner task>
type: <event type>
repo/worktree: <owning repository and absolute checkout>
base: <formal baseline>
commit: <exact SHA or none>
dirty: <true or false, with reason>
verified: <checks and direct evidence>
unverified: <remaining claims>
blocker/decision: <owner, condition, and options when applicable>
next: <next authorized action>
push/PR/merge: <separate states>
```

Reference files, exact SHAs, relevant log excerpts, and artifact URLs. Do not
send large image base64 payloads, complete tool-result objects, or full logs into
the manager context. Keep images in native media/file artifacts and inspect only
what the current verification needs. A report must still identify its evidence;
compactness is not permission to omit a failure or outstanding delivery step.

At material checkpoints and final handoff, append compact efficiency evidence:

```text
timing: <task-start, first-material-artifact, final when known>
continuations: <count>
model/effort: <explicit selection>
duplicate-check-avoided: <count and referenced evidence, or 0>
```

Keep these fields in events or handoffs only. Do not create a telemetry service,
token database, recurring status job, or another heartbeat to collect them.

Do not describe a local candidate as formally merged, a passing test as live
verification, or a formal merge as user acceptance.

For a PR, handoff, preview, or feedback event that touches a user-visible
surface, also include:

```text
product-impact: <none | presentation-only | product-impacting, plus surface>
preview-status: <not-required | active | ready | accepted | required>
```

Page renderer, Host/plugin ownership, information architecture, Host chrome,
Composer, persistent-panel, and navigation/back changes are
`product-impacting`, even when implemented as a refactor. Link the manager's
product baseline checkpoint when one exists. Do not infer `accepted` from CI,
merge, preview availability, or silence.

## Manager behavior

On receipt, the manager updates the visible ledger, resolves owner-to-owner
handoffs, routes decisions to the user, and presents reviewable artifacts. The
manager does not wait for a task that can continue independently. Owner events
are coordination inputs, not a request to broadcast every receipt to the user.
Aggregate them into a usable result, material blocker, or decision. Check the
current task scope and diff before redirecting work based on an old handoff.

Process material events as they arrive. Without a report, recovery inspections
must be at least five minutes apart; use the existing event wait or authorized
heartbeat rather than repeatedly waking the manager or owners. Keep the last
recovery time and outstanding owner in the existing compact ledger. Do not add
an independent scheduler, telemetry database, or checking script. A timeout or
unchanged snapshot alone is not a reason to inspect again sooner.

Recovery starts with a compact current-state snapshot for the missing owner.
If it is inconclusive, read only that task's latest relevant turn and referenced
PR/check evidence; do not repeatedly scan full conversation histories. Request
a missing report from the original owner before considering replacement. Do not
create a duplicate task simply because reporting is delayed.

A real anomaly, material owner event, or user request for current status permits
an immediate targeted read; identify the reason when reporting the finding.
These exceptions do not establish a faster recurring polling loop. Unchanged
recovery results stay silent, but an actual failure or decision is handled
promptly. Keep a working event or recovery path while delegated work remains;
if reporting or wakeup tools are unavailable, state that limitation and the
remaining handoff rather than claiming unattended coverage.

These are rules for manager and owner execution, not a tool-enforced timer or a
guarantee of event delivery. Quiet waiting never discharges the manager's final
merge, acceptance, integration, or authorized publication responsibility.

Two consecutive manager continuations or recovery turns with no reviewable
diff, reproduction, PR, or single evidence-backed blocker require re-scoping,
narrower validation, a compact new stage, or ending the ineffective task. They
do not authorize killing a healthy build. Before treating CI as stuck, inspect
job timestamps, its established duration range, and live or final logs; an API
timeout, EOF, or transient `in_progress` state alone is not evidence of a hang.
