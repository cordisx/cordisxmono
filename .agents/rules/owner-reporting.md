# Owner Reporting Protocol

Use this protocol whenever a responsible manager coordinates two or more Codex
tasks. Task owners actively report material events to the manager's source task.
The manager must not rely on waiting, manual polling, or the user noticing that
a task has finished.

## Dispatch requirements

Every owner delegation must include:

- the manager source task ID;
- the event types below;
- the required report fields;
- an instruction to continue after reporting unless a decision or real blocker
  requires a pause.

The owner acknowledges the protocol at task start. Reused tasks receive the
same protocol before new work is assigned.

## Events that require immediate reporting

- `DECISION_REQUIRED`: product, scope, authority, or destructive-action choice;
- `BLOCKED`: a concrete dependency or external condition prevents progress;
- `NEED_API` or `API_READY`: a cross-owner contract request or immutable handoff;
- `CHECKPOINT_READY`: a clean committed local checkpoint exists;
- `PREVIEW_READY`, `FEEDBACK_READY`, or `INTEGRATION_FAIL`: a review surface is
  ready, updated feedback is visible, or integration failed materially;
- `PR_READY`, `MERGED`, or `FINAL_REPORT`: remote delivery state changed.

Ordinary progress, unchanged state, waiting, timeout, and `cleanup_pending` stay
silent.

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

Do not describe a local candidate as formally merged, a passing test as live
verification, or a formal merge as user acceptance.

## Manager behavior

On receipt, the manager updates the visible ledger, resolves owner-to-owner
handoffs, routes decisions to the user, and presents reviewable artifacts. The
manager does not wait for a task that can continue independently.

A low-frequency heartbeat may check for owners that completed or blocked without
reporting. It is a recovery mechanism only: it must not replace active owner
reports, emit unchanged status, repeat old results, or become the normal source
of task state.
