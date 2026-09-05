# Splitting files before they become bottlenecks

Use this guide near the [file-size threshold](../rules/file-size.md), when
several tasks keep editing the same file, or when one feature requires updates
to several central lists. The 800/1000 thresholds prompt a design decision; they
do not define the ideal module size.

## Identify the boundary before moving code

Write a short plan in the task or PR before adding another responsibility:

1. What does this file own, and which new responsibility is being added?
2. What is the proposed module's public input/output or service interface?
3. Who creates it, grants authority, and disposes its resources?
4. Which imports may cross the boundary, and which direction must they follow?
5. Which existing behavior and public imports must stay valid after the move?

A useful plan might say: “Move a capability's registration and resource cleanup
into its owner module. Keep the existing authorization service. The composition
entry installs that module once. Verify two owners concurrently and cleanup
after failed activation.” This defines a boundary that can be reviewed before
code moves. Detailed product designs remain in their owning repository.

## Choose a cohesive module

| Growing area                    | Useful split                                                                                 | Check that the split actually helps                                                                                                   |
| ------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime composition             | Capability modules owning installation, scope and disposal                                   | Adding one service should not require updating several independent central lists. Reuse the established context and lifecycle system. |
| State and event processing      | Durable facts, live subscriptions, authority/leases and projections with explicit boundaries | Reconnecting or replacing a lease must not erase durable identity. There remains one authoritative fact store.                        |
| Product presentation            | Behavior model, product views, and adapters at their declared public boundaries              | Existing accepted behavior survives; a smaller implementation is not permission to ship a reduced demo.                               |
| Platform or version integration | Normalize public versions at adapters; keep a coherent internal model                        | Version differences stay at the edge. New adapters do not create a second runtime or grant themselves authority.                      |
| Tests                           | Behavior suites with small reusable setup helpers                                            | Each suite runs independently. Avoid hidden global state and giant shared fixtures that couple unrelated behaviors.                   |
| Documentation                   | An overview linking to focused topic documents                                               | Move the authoritative content once; preserve published links/anchors and update the owner index.                                     |
| Large schema/configuration      | Cohesive definitions and supported references or generated composition                       | Validate the resolved artifact. Preserve frozen versions, public exports and serialization compatibility.                             |

Small directories are useful when they expose a clear entry and hide internal
details. Avoid `part1`, `part2`, a growing miscellaneous `utils`, or a shared
“context” object that hands every module all mutable state. These preserve the
coupling and merely distribute it across more files. Do not create one file per
function unless the responsibility or reuse warrants it.

## Lessons from recurring delivery failures

- **Repeated missing registration or cleanup is a design signal.** If one new
  capability needs edits to installation, isolation, type exposure and several
  disposal lists, let its owner module carry the cohesive lifecycle. Keep the
  public type/export check at the consumer boundary so runtime registration and
  the advertised API cannot silently drift apart.
- **Different lifetimes need different ownership.** A persistent conversation,
  a connection, a permission lease and a preview-reset request do not have the
  same lifetime. Define their transitions before extracting helpers. Initial
  state synchronization should not accidentally perform a reset transaction.
- **Adapters need an explicit transition plan.** While old and new consumers
  coexist, record which path owns current product behavior, what compatibility
  maintenance remains, and the evidence required for the switch. Moving files
  does not itself complete the migration.
- **File contention should guide sequencing.** Prefer a small extraction that
  removes the next shared edit point. Agree on exports with adjacent tasks;
  keep pure moves and behavior changes reviewable separately. Avoid a blanket
  rewrite of every historical large file while feature work is underway.

These are general lessons from the September 2026 cross-repository audit, not a
claim that every historical defect still exists. Current implementation status,
code examples and corrective decisions belong in the owning repository.

## Verify the result

Format the changed files with dprint, run ESLint, then the owning repository's
checks appropriate to the move. Focus verification on the boundary: public imports,
concurrent owners, failed activation cleanup, subscription replacement, replay,
or preserved user behavior as applicable. Do not add a second ledger, broaden
permissions, or weaken tests to make an extraction pass.

In the PR, state the old responsibility, the new module boundary, the remaining
composition entry, and validation. If an old oversized file remains, record its
before/after count and the next natural extraction point. A shorter file is
useful evidence; fewer unrelated edits needed for the next feature is the
architectural outcome.
