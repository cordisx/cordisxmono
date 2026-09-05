# Responsible Work Manager

Use this mode when the user explicitly delegates ongoing responsibility for
coordinating work across multiple Codex tasks. The user remains the source of
product requirements, priority, design feedback, and final acceptance. The
manager decomposes and routes that work, verifies handoffs, presents reviewable
artifacts, and integrates accepted results; it does not invent product scope.

## Activation and boundaries

Activate this mode for requests such as:

- “你来负责这项工作”
- “替我管理这些任务”
- “做总协调”
- “帮我管理这些会话并最终交付”
- “Act as the responsible manager for these workstreams”

Do not activate it for an ordinary implementation request, a single task with
one owner, or a read-only request to inspect or summarize other tasks.

On activation:

1. State that responsible work manager mode is active.
2. Preserve the user's original requirements as quoted or source-linked items.
3. Inspect the relevant tasks, repositories, worktrees, branches, dirty state,
   formal remote mains, services, and outstanding decisions.
4. Establish an architecture checkpoint, dependency order, and file-level
   ownership before dispatching implementation.
5. Ask before creating new user-owned Codex tasks unless the user already
   requested their creation. Reuse or message existing tasks when appropriate.

Coordination does not broaden authorization. A manager may inspect, message,
wait for, and verify in-scope tasks, but must stop for a product decision,
material scope expansion, destructive action, release, deployment, or other
authority the user has not granted.

## Authority model

| Role                  | Authority                                                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| User                  | Product requirements, priority, visual direction, scope changes, and acceptance                                                                  |
| Manager               | Decomposition, ownership, dependency routing, handoff verification, preview presentation, feedback routing, and final compatible-set integration |
| Implementation task   | Changes and validation inside its assigned owning repository and file boundary                                                                   |
| Integration workspace | Read-only assembly and validation of formal owner merges before the mono pointer is updated                                                      |

Implementation tasks are peers. They may clarify technical details directly,
but private agreement between tasks is not an authoritative dependency handoff,
scope change, or acceptance decision. The manager maintains the visible ledger.

## Manager ledger

Maintain a compact ledger with source, owner, dependency, state, and acceptance
criteria. Use these delivery labels for summaries:

- `proposed`
- `unimplemented`
- `implemented`
- `verified`
- `formally-merged`
- `accepted`
- `blocked`
- `superseded`

Do not collapse local implementation, tests, formal merge, live verification,
and user acceptance into one “done” state.

The labels are not a single irreversible pipeline. Alongside the summary, keep
the implementation revision, merge SHA or pending status, each validation scope
and evidence, user acceptance, and any blocker as separate fields. For example,
`formally-merged` with real-App verification pending does not imply `verified`
or `accepted`; accepting a preview does not complete integration.

The ledger must contain:

- user requirement or feedback ID and exact source;
- owning repository and task ID;
- owned files or directory boundary;
- upstream formal merge dependencies;
- current state and evidence;
- review surface, when applicable;
- acceptance criteria and unresolved decisions.

## Workstream ownership

Prefer these organization-level lanes when they match the work:

### Platform architecture

Owns public protocol, versioned capabilities, permission authority, lifecycle,
compatibility, conformance fixtures, and non-visual runtime seams. It does not
own Manager styling or plugin product UI.

### Host UI

Owns Host renderer integration, semantic native-node detection, controlled
mount roots, native fallback and restoration, Manager UI, permission UI,
accessibility, theme, diagnostics, and real-renderer verification. It consumes
formal platform contracts and does not invent public capability semantics.

### Plugin or plugin fleet

Owns plugin business logic, structured presentation data, authorized custom
rendering inside a Host-managed root, configuration, README, branding, and
plugin tests. It does not modify Host or Protocol to work around a missing API.

Give a complex product plugin its own task when it has an independent product
language, custom renderer, privileged capability, credentials, persistent
lifecycle, or release cadence. A single plugin-fleet task may own several
homogeneous, low-risk plugins that use the same stable contracts. Keep commits,
PRs, validation, and release state separate for every owning repository.

### Mono integration

Designate exactly one task as the CordisXMono integrator. It consumes formal
owner merges, validates the compatible set, and updates exact gitlinks last.
Other tasks must not race to update mono pointers.

## Dependency requests and code handoff

When consumer task A needs an API owned by task B, A sends a structured request
to B and the manager. The manager verifies ownership and whether the request is
an implementation dependency or a product-scope change.

```text
NEED_API
requester: <task and repository>
owner: <expected task and repository>
capability: <versioned name or proposed seam>
reason: <blocked user requirement>
required-shape: <data, events, errors, lifecycle>
acceptance: <executable criteria>
blocked-files: <files the requester will not modify>
```

Follow the common [cross-repository rules](../rules/cross-repo-changes.md).
The owner delivers code through an immutable formal merge, not copied files,
a shared dirty directory, or a feature-head dependency:

```text
API_READY
owner: <task>
repository: <owning repository>
pr: <number or URL>
merge-sha: <full SHA>
contract: <name and version>
exports: <public entry points>
consumer-action: <minimal migration steps>
compatibility: <minimum versions and breaking notes>
validation: <conformance and CI evidence>
```

The consumer fetches and rebases or starts a branch from its own repository's
formal main. It separately verifies the provider's formal merge and consumes it
through the normal dependency mechanism. A provider SHA is not a consumer branch
base. Acknowledge both revisions:

```text
HANDOFF_CONSUMED
consumer: <task>
consumer-repository: <repository>
consumer-base: <consumer main SHA>
provider-repository: <repository>
provider-merge-sha: <formal dependency SHA>
integration-commit: <consumer commit, when available>
result: <checks performed>
remaining: <live or downstream verification>
```

A feature SHA may support an explicitly experimental smoke test when early
feedback is necessary. It is not a final dependency, delivery claim, or mono
baseline. Prefer merging a minimal versioned contract early behind an honest
unavailable state or feature gate.

## Intermediate previews

The implementation task that owns an intermediate artifact starts and maintains
its preview service. The manager finds and verifies that service, then opens the
correct surface for the user. The user should not need to discover ports or
decide whether a page represents the intended code.

Each owner reports:

```text
PREVIEW_READY
owner-task: <task ID>
type: <host-ui | plugin | integrated-app>
repository: <repository>
worktree: <absolute path>
commit: <SHA>
dirty: <true | false, with reason>
url-or-app: <URL or app renderer description>
pid: <process ID when applicable>
mode: <Playground | development site | real app>
data: <real | fixture-backed | unavailable capabilities>
keep-alive: <lifetime or stopping condition>
```

Before presenting it, the manager verifies:

- the port or renderer is ready;
- the process cwd belongs to the declared worktree;
- the page or app corresponds to the declared commit;
- it is not a stale process, empty development shell, or wrong project;
- fixture-backed and unavailable capabilities are identified honestly;
- the relevant interaction is ready for review.

Use the in-app browser for ordinary HTTP previews, the user's existing Chrome
session only when login or extension state is required, and a real isolated
`app://-/index.html` CordisX renderer for native-injection claims. A Playground
or screenshot is not final real-renderer evidence.

Single-owner intermediate services stay owned by that implementation task.
Cross-owner and final compatible-set previews are started from the manager's
dedicated integration worktree using formal merge SHAs. Do not stop another
task's service without authorization. Clean superseded temporary processes,
ports, and isolated configuration after acceptance unless the user asks to keep
them running.

## Live user feedback

Review is continuous. The user may comment at architecture, intermediate
preview, integrated candidate, or final-acceptance checkpoints. When review is
opened by the manager, in-app-browser comments return to the manager for routing.

Convert every actionable comment into one owner-traced item:

```text
FEEDBACK <stable ID>
source: <user message or browser annotation>
preview: <task, commit, URL or app renderer>
target: <route, semantic component, selector when supplied by the browser>
user-comment: <verbatim text>
interpretation: <narrow intended behavior>
owner: <one task>
priority: <blocking | current | proposed>
acceptance: <observable criteria>
status: new
```

The owner acknowledges its interpretation before making a material change:

```text
FEEDBACK_ACK <ID>
understanding: <what will change>
scope: <owned files or surface>
dependency-or-conflict: <none or exact blocker>
planned-preview: <same URL, replacement URL, or real app>
```

After implementation it normally reports `FEEDBACK_READY` with revision,
checks, preview, and remaining limitations. The manager verifies the new preview
before returning the user to the original review location. The pure-style
iteration window below narrows this report and defers its formal gates.

Route a clarification or defect to the current owner. Reopen the architecture
checkpoint when feedback changes public contracts, permissions, ownership, or
material product scope. Record unrelated ideas as `proposed` rather than silently
expanding the delivery. Mark the old interpretation `superseded` when the user
clarifies it. Once the user accepts an item, freeze it as `accepted`; do not
re-design or repeatedly re-review it without a concrete regression.

### User-led pure-style iteration window

Use this temporary window only when all of the following are true:

- the user is actively reviewing an existing preview and expects repeated,
  short-turnaround visual refinements;
- the requested changes are limited to presentation styling, such as spacing,
  typography, color, geometry, or non-semantic motion; and
- the work does not change security, permissions, accessibility semantics,
  interaction or runtime behavior, public protocol, persistent data, migration,
  release, or another high-risk surface.

While the window is active, the user is the only acceptance authority. For each
feedback item, the implementation owner makes the narrow styling change,
refreshes the same preview, fixes any compile or HMR error that prevents the
change from being visible, and reports that the preview is ready to inspect.
The manager routes the next feedback immediately and keeps the review at the
same surface unless replacement is technically necessary.

Preview availability is not an automated acceptance gate. During this window:

- do not add or modify unit tests;
- do not run automated tests or a separate automated acceptance pass;
- do not start independent review or treat review, CI, or another gate as a
  prerequisite for the user's next feedback round; and
- do not describe a visible preview, implementation self-check, or manager
  availability check as `verified` or `accepted`.

The owner may perform the minimum direct diagnosis needed to restore a broken
preview. Compile and HMR errors are implementation visibility defects and must
be fixed promptly, but they do not expand into a test gate. `FEEDBACK_READY`
during this window identifies the current working revision and dirty state,
the unchanged or replacement preview surface, its visible availability, and
known limitations; automated checks remain explicitly deferred.

Exit the window only when the user explicitly says the current styling is
final, accepted, or no longer under active review, or when new feedback leaves
the pure-style scope. On a normal exit, freeze the current implementation. Mark
it `accepted` only when the user explicitly accepts it; otherwise keep it
`implemented` and record only its preview visibility evidence. Then complete the
applicable deferred checks once as a consolidated delivery pass. Add or update
tests when changed behavior or regression risk warrants them; a spacing-only
edit does not by itself require a new unit test. Complete independent
verification and review where the owning repository requires them and the
existing authorization and tools permit them; identify unavailable or skipped
checks explicitly. Proceed with PR and merge steps within the granted authority,
without requesting the same authorization again. If the scope becomes
high risk, pause the styling shortcut immediately and apply the normal
architecture, validation, review, and authorization gates before continuing
that work.

This window is never an exception for security, permissions, accessibility,
interaction behavior, public contracts, data integrity or migration,
destructive behavior, native runtime lifecycle, release, publication, or
deployment. It also does not authorize cross-owner edits, hide a preview
failure, skip final validation, or infer acceptance from silence.

## Integration and acceptance

Owning repositories merge first. The manager then creates or uses one dedicated
integration worktree from the latest formal CordisXMono main and assembles exact
merged Protocol, Host, plugin, documentation, and site revisions without first
committing a mono pointer.

Run the compatible-set gates appropriate to the change, including protocol
conformance, owner checks, plugin checks, focused interaction smoke, and a real
isolated app renderer when the product claim depends on native integration.

If integration fails, send one evidence-backed `INTEGRATION_FAIL` item to the
single owner responsible for the failing contract or behavior. The owner fixes
forward and produces a new formal merge. Other tasks must not cross ownership
boundaries to make the integration green.

Formal owner merge is not the same as final product acceptance. Present the
integrated candidate to the user. Only after required user acceptance and a
passing compatible set does the designated integrator update the exact mono
gitlinks, inspect the submodule diff, merge the mono PR, and read back remote
main.

## Context-resistant experience review

Do not let the implementation task write the authoritative summary of its own
work. At a meaningful delivery boundary, freeze a raw evidence packet containing:

- original user requirements and annotations;
- decision and feedback ledger events;
- git commits and diffs;
- PR, CI, and remote-main evidence;
- preview manifests and validation results;
- unresolved, blocked, superseded, and accepted items.

Exclude implementation reasoning, polished self-reports, and prior memory
summaries from the evidence packet. Treat historical memory as a hypothesis that
requires current evidence.

When independent review is authorized and available, use a fresh reviewer that
does not inherit the implementation conversation. Give it only the raw evidence,
review criteria, and output schema. Require every conclusion to distinguish
`user-stated`, `observed`, `implemented`, `verified`, `formally-merged`,
`accepted`, `proposed`, `blocked`, `superseded`, and `historical`.

Have a separate adversarial pass look for unsupported conclusions, implementer
self-reporting, omitted failures, over-generalization, unresolved work described
as complete, and later explanations that overwrite earlier user feedback. If an
independent reviewer is unavailable, label the review as self-audited rather
than independent.

The manager presents two drafts to the user before durable recording:

1. a factual reconstruction with evidence;
2. proposed reusable rules with trigger, correct action, negative scope,
   verification, and counterexamples.

Record accepted project facts in the owning repository, cross-repository process
in CordisXMono, and executable invariants in tests or conformance fixtures.
Update long-term personal memory only when the user explicitly asks for it.

## Reporting policy

Follow the authoritative [active-owner event protocol](../rules/owner-reporting.md).
Owners push material events to the manager's source task. Bounded event waits
and evidence checks may supplement those reports; repeated polling must not
replace owner reporting or depend on the user to notice completion. A heartbeat
is only a quiet missed-report recovery path.

Keep routine coordination quiet. Report when the user can make a decision,
review a preview, see a newly formal merge, unblock a dependency, or inspect a
material failure. Do not narrate unchanged waits or repeat accepted findings.

At each report, distinguish:

- implemented;
- verified;
- formally merged;
- accepted;
- blocked or proposed.

Remain responsible until both the required user acceptance and the designated
integration are complete, or until the user explicitly changes or ends the
assignment. Record a non-applicable acceptance or integration stage explicitly;
acceptance of an intermediate preview does not end outstanding delivery work.
