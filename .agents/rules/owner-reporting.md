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
- `BLOCKED`: a concrete dependency or external condition prevents progress;
- `NEED_API` or `API_READY`: a cross-owner contract request or immutable handoff;
- `CHECKPOINT_READY`: a clean committed local checkpoint exists;
- `PREVIEW_READY`, `FEEDBACK_READY`, or `INTEGRATION_FAIL`: a review surface is
  ready, updated feedback is visible, or integration failed materially;
- `PR_READY`, `MERGED`, or `FINAL_REPORT`: remote delivery state changed.

Ordinary progress, unchanged state, waiting, timeout, and `cleanup_pending` stay
silent.

Reuse successful evidence for the same repository SHA, inputs, environment, and
check version by reference. Do not paste its old output or rerun it merely to
produce another status event. A changed SHA or invalidated dependency reruns
only the affected evidence required by the applicable gate.

After `FINAL_REPORT`, end the owner turn when its delegated scope is complete
and no authorized work remains. Report any handoff obligations before ending;
do not invent further work to satisfy the continuation instruction.

## Required report payload

Reports must identify:

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
manager does not wait for a task that can continue independently.

A low-frequency heartbeat may check for owners that completed or blocked without
reporting. It is a recovery mechanism only: it must not replace active owner
reports, emit unchanged status, repeat old results, or become the normal source
of task state.

Two consecutive manager continuations or recovery turns with no reviewable
diff, reproduction, PR, or single evidence-backed blocker require re-scoping,
narrower validation, a compact new stage, or ending the ineffective task. They
do not authorize killing a healthy build. Before treating CI as stuck, inspect
job timestamps, its established duration range, and live or final logs; an API
timeout, EOF, or transient `in_progress` state alone is not evidence of a hang.
