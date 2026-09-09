# AI-native adaptive development — initial experience

Audience: CordisX repository maintainers and development agents. This internal
engineering guide covers Host, simulator/Playground, plugin and cross-repository
work; it is not a third-party plugin authoring guide.

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

## Keep development feedback attached to the running source

The same feedback problem affects Host, simulator/Playground and plugin work.
A preview can fall behind even when the edited code builds successfully: the
running process may resolve an installed SDK or another checkout. Repeatedly
packaging that code turns a short visual feedback loop into an integration
cycle. Source-connected development reduces that delay, while package and clean
installation checks still answer separate delivery questions.

"Host SDK" is a packaging label, not an execution boundary. It can contain
renderer code and Node-side services with different update needs:

| Changed area                                     | Development implication                                                                                            |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Refresh-compatible plugin or Host React modules  | Vite can update the component boundary without rebuilding the whole App.                                           |
| Host renderer runtime outside a refresh boundary | CordisX can recreate its runtime in the existing document; an Electron restart is not inherently necessary.        |
| Node-side launcher or bridge                     | A page refresh cannot replace code already running in that process; its own supported reload or restart is needed. |
| Optimized dependencies or shared React           | A stale module graph or singleton can survive an ordinary refresh; cache and runtime identity need diagnosis.      |

These examples explain the choice, not a guarantee for every version. The
Host-owned [internal documentation](https://github.com/cordisx/cordisx/blob/main/.agents/docs/README.md)
and [native debugging runbook](https://github.com/cordisx/cordisx/blob/main/.agents/docs/native-debugging-runbook.md)
are the entry points for supported mechanisms. Source-linked sessions shorten ordinary
Host/plugin iteration; installed SDK candidates remain useful for checking the
package a consumer will actually receive.

Presentation feedback and provider capability repairs can often advance
independently. A plugin layout improvement need not wait for an unrelated
Host/Protocol repair. Batching compatible, ready provider fixes can reduce
interruptions, but waiting to batch everything can delay useful feedback.
Likewise, a dependency-cache failure explains a particular recovery step; it
does not establish that later UI edits should abandon hot updates.

A simulator is useful for the UI and capabilities it actually hosts. Its fast
feedback does not by itself demonstrate native injection, permissions or App
lifecycle behavior. Detailed Host and simulator launch/debug procedures belong
in the owning repository's internal runbooks, while this guide explains the
shared coordination choices.

The mandatory execution requirements are in the
[internal development feedback rule](../rules/development-feedback.md);
this guide retains the reasoning and tradeoffs rather than a second checklist.

## Internal plugins as extension-point design inputs

Internal and external plugin authors share the public contract, but have
different collaboration paths when that contract is insufficient. Internal
plugin work provides concrete evidence for evaluating Host and Protocol
evolution. External developers can bring that evidence through issue discussion
and design or implementation PRs. The internal team can assess the provider
design directly within its assigned scope rather than treating every missing
capability as the end of plugin work.

A useful extension point separates the common interaction from the requesting
plugin's product choices. A pet interaction, for example, can motivate a review
of a reusable visual seat or input capability; it does not by itself justify a
pet-specific Host API. Other plausible consumers help test the boundary, while
permissions, lifecycle and compatibility constrain how broadly it should be
exposed. This is a design heuristic, not a claim that any example capability
already exists or should necessarily be added.

The goal is a small contract that serves real plugin needs, not a general
framework built ahead of evidence. The
[capability-gap rule](../rules/development-feedback.md#evaluate-missing-capabilities)
defines the internal assessment and external collaboration paths.

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
