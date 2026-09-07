# AI-native adaptive development — initial experience

This initial experience helps an Agent work like a responsible developer: keep
one shared base and non-negotiable boundaries, then choose the shortest safe
route to useful feedback. It is guidance for judgment, not an exhaustive
procedure, approval flow, scorecard, or new gate. Revise it from evidence in
real task retrospectives.

## Decision frame

Separate four things before acting:

- **Hard boundaries:** repository ownership, explicit user scope, security and
  persistent-data integrity, public-contract compatibility, accepted product
  baselines, exact release provenance, and prohibitions such as no subagents or
  no service operations. An Agent cannot trade these for speed.
- **Default path:** begin from the task packet's formal base, work in the owner
  repository, follow Protocol → Host → consumer when a public contract changes,
  choose the applicable risk-tier gate, and promote only canonical main commits
  into a formal release or Mono compatible set.
- **Autonomous space:** select focused checks, parallelize independent work,
  prepare stacked changes, use an exact experimental dependency, choose a safe
  preview, and fix a local failure without asking for each intermediate step.
- **Decision responsibility:** keep the result inside the hard boundaries and
  leave a brief record of why a non-default route was useful, its remaining
  risk, and where the deferred evidence will be completed.

An Agent may depart from the default path without escalation when the user has
already authorized the outcome and the departure stays inside the hard
boundaries. When the choice affects a handoff, briefly explain its basis,
remaining risk, and where deferred evidence will be completed. Routine choices
do not need a separate decision form.

Escalate when the choice changes the product, ownership, public contract,
authority, destructive effect, or user acceptance—not merely because the Agent
chose a different safe implementation sequence.

## Exact experimental dependencies

Development may pin a reviewed but unmerged provider PR commit by its full SHA.
A consumer branch still starts from its own repository base and records the
provider PR/SHA; it does not pretend the provider branch is canonical main.
Related provider and consumer branches may form a stacked branch/stacked PR set
so feedback and compilation proceed before the whole stack merges.

Every stacked PR labels the dependency experimental, identifies its upstream
PR/SHA, and states the promotion point. Before formal owner merge, publication,
release, or Mono integration, merge the provider in ownership order, replace
the experimental pin with its canonical main merge SHA, update the consumer
from its own main, and run the required formal gates. A feature SHA is a
development input, never release provenance.

## Match proof to the next decision

| Next decision                       | Sufficient evidence                                                                                                                            |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Continue development                | Changed files and real dependency closure compile; focused reproduction/tests give actionable feedback                                         |
| Ask the user to experience it       | The smallest honest vertical slice is visible on a correctly identified preview; unavailable or fixture-backed behavior is labeled             |
| Merge a pull request                | Independent review when required, the actual required checks and applicable owner gate; formal provider pins for dependent changes             |
| Publish, release, or integrate Mono | Canonical owner revisions, applicable full/integration gates, required real-runtime proof, and user acceptance when the assignment requires it |

Build the smallest experienceable vertical slice before broad hardening when
the hard boundaries permit it. For UI and presentation work, prefer the same or
an isolated preview early; pure-style feedback stays in the existing
preview-first window. Structure, ownership, interaction, permission, data,
native, and release changes leave that shortcut and retain their normal gates.

Keep a successful CI result attached to its actual SHA, base, gate and
environment; never relabel it as a result for a new head. Unrelated main movement
is not itself a reason to rebase a healthy candidate or manually repeat full
checks. Refresh when a conflict, relevant dependency, required check or merge
policy requires it; after a change, invalidate the affected evidence.
Treat a local failure locally: fix the responsible owner or narrow
the next check instead of restarting unrelated lanes. Each work round produces
a reviewable diff, reproduction, preview, PR, verified evidence reference, or
one precise blocker. If it produces none, change the approach rather than
repeating the same instruction or full validation.

## Keep the user result on the critical path

Independent work can proceed concurrently; dependent work can use the stacked
path above. A pending provider merge blocks formal promotion, not all consumer
development. Do not bundle unrelated finished work merely to produce one PR.
Keep follow-on product ideas in their own scope so a usable repair can ship.

Before intervening in another task, read its current user instructions and
actual diff: an old title or stale handoff is not evidence of conflicting work.
A long task can have substantial output while still missing the user result.
Report both, and aggregate owner receipts into a usable result or precise
blocker instead of forwarding every acknowledgement.

An explicitly authorized, independent plugin debug instance may be restarted,
hot-updated or switched to a fix without repeatedly asking about temporary
drafts. Preserve its persistent data and non-target instances; an explicit
freeze still applies. Keep the durable launch entry on the working repair
combination so the user is not sent back to an obsolete candidate. Use the owner
runbooks for [native launch and recovery](https://github.com/cordisx/cordisx/blob/main/.agents/docs/native-debugging-runbook.md)
and [Room history, identity and CLI diagnosis](https://github.com/cordisx/plugin-chatroom/blob/main/.agents/docs/runtime-debugging.md).

## Capture reusable experience early

When a task finds a reusable failure mode, disproves an implementation direction,
or meets the same blocker again, record the lesson promptly in the owning
technical documentation before continuing broad experimentation. Do not wait
for the whole task to finish when the note can prevent the next repetition. A
chat, task event, or handoff report is useful coordination evidence, but is not
durable documentation.

Keep verified facts, rejected paths, current hypotheses, and last-known-good
evidence visibly distinct. Cite the applicable file, SHA, run, or reproduction.
A hypothesis stays labeled as such and is updated or removed after final proof;
it must not silently become an implementation rule.

These choices optimize time to feedback and delivery; they do not collapse
`implemented`, `verified`, `formally-merged`, `live-proven`, and `accepted` into
one state.
