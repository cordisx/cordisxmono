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
boundaries. Record only:

```text
ADAPTIVE_DECISION
basis: <current evidence and why this is the shortest safe route>
risk: <what this route does not yet prove>
backfill: <preview, owner gate, formal merge, or release point that closes it>
```

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

| Next decision                 | Sufficient evidence                                                                                                                    |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Continue development          | Changed files and real dependency closure compile; focused reproduction/tests give actionable feedback                                 |
| Ask the user to experience it | The smallest honest vertical slice is visible on a correctly identified preview; unavailable or fixture-backed behavior is labeled     |
| Merge, publish, or release    | Canonical owner mains, applicable full gates, exact integration assembly, required real-runtime proof, and explicit product acceptance |

Build the smallest experienceable vertical slice before broad hardening when
the hard boundaries permit it. For UI and presentation work, prefer the same or
an isolated preview early; pure-style feedback stays in the existing
preview-first window. Structure, ownership, interaction, permission, data,
native, and release changes leave that shortcut and retain their normal gates.

Reuse evidence only when SHA, base, gate version, classification, and environment
still match. Treat a local failure locally: fix the responsible owner or narrow
the next check instead of restarting unrelated lanes. Each work round produces
a reviewable diff, reproduction, preview, PR, verified evidence reference, or
one precise blocker. If it produces none, change the approach rather than
repeating the same instruction or full validation.

These choices optimize time to feedback and delivery; they do not collapse
`implemented`, `verified`, `formally-merged`, `live-proven`, and `accepted` into
one state.
