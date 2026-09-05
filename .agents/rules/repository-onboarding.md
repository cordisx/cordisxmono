# Repository onboarding

Apply this rule whenever the Mono workflow creates, transfers, adopts, or
discovers an omitted organization repository. Repository creation and its Mono
admission are one delivery. Work in a temporary clone or separate owner task is
allowed, but that checkout alone is not completion.

## Ownership and scope

The repository owner delivers the canonical identity, purpose, visibility,
formal revision and dependency evidence. One designated Mono admission owner
registers it and verifies cloning. The responsible manager or Mono maintainer
reviews the admission PR and any exclusions; merge authority remains explicit.
Name those people or tasks in the handoff, not in permanent product guidance.

Use the existing [ownership table](../docs/organization-context.md#repository-ownership)
as the only inventory. `.gitmodules` owns clone URLs and paths; gitlinks own
revisions. Do not add a parallel registry, copy product code into Mono, or
duplicate product documentation here.

For `org/repo`, mount exactly `vendors/org/repo` from
`https://github.com/org/repo.git`. Confirm the official remote identity before
writing it. Normalize case and renamed clone aliases to the canonical identity;
multiple worktrees or temporary clones of that identity need only one mount.
The Mono root is listed but never mounted inside itself.

Third-party dependencies remain with their product owner. Archived repositories,
unrelated forks, and ambiguous candidates require an evidence-backed exclusion
or scope decision, not automatic admission. Do not create remotes, change
visibility, or grant organization permissions as a side effect of registration.

## Completion checklist

- [ ] The official remote exists; canonical `org/repo`, clone URL, visibility,
  accountable maintenance role, and purpose are recorded in the existing table
  and `.gitmodules`. Confirm transfers and default-branch names remotely.
- [ ] The owner has pushed and formally merged the selected commit. Fetch its
  official default branch, verify the full commit is reachable from that branch,
  and record full commit and tree SHAs plus owner PR/evidence. A feature head,
  local-only commit, or branch-tracking submodule does not satisfy this check.
- [ ] The matching mode `160000` gitlink is staged at `vendors/org/repo`.
  Existing gitlinks stay unchanged unless separately assigned for integration.
- [ ] Every private mount has `update = none`. Public initialization needs no
  private token; private initialization uses only authorized per-command opt-in.
  Keep private content and credentials out of public records. If even identity
  metadata is restricted, record a sanitized blocker with the manager rather
  than publishing it or pretending admission is complete.
- [ ] Ownership and onboarding entry points link to the authoritative sources.
  Run the offline consistency check, its regression tests, diff/link review, and
  a fresh anonymous recursive public clone/init at the candidate revision.
  Record exact results, including any failure and private mount skip.
- [ ] Reconcile official organization metadata against the inventory, then
  deduplicate relevant task/worktree canonical origins. Record omitted,
  excluded, and uncertain candidates with reasons and follow-up ownership.
- [ ] Report owner and Mono PRs, full SHAs/trees, added mounts, validation scope,
  dirty state, dependencies, exceptions and remaining decisions to the manager.
  Admission is complete only after the authorized Mono merge and remote
  readback. A ready PR is a reviewable checkpoint, not a completed merge.

Initial admission can record a formally merged product whose dependencies differ
from Mono's existing pins. Report that fact explicitly; never silently advance
other repositories to make registration appear compatible. Product upgrades and
compatible-set acceptance still follow
[cross-repository changes](cross-repo-changes.md). Public cloning and registry
consistency do not prove runtime behavior or user acceptance.

## Omission audits and exceptions

The admission owner runs an inventory reconciliation for every new admission;
Mono maintainers also run it during organization maintenance or repository
transfer/reorganization. The offline check catches local inconsistencies but
cannot discover a repository never declared in Mono or verify remote visibility.
The [maintainer runbook](../docs/repository-onboarding.md) supplies both checks.

Record each unresolved exclusion or exception in the admission PR and a dated
Mono history record: candidate identity (redacted if necessary), observed date,
evidence, reason, decision owner, related task/PR, next action and review trigger
or deadline. Link the record from the organization context. Historical records
are observations, not a second live inventory or a silent exemption from checks.
An unpushed/empty remote, missing permission, or ambiguous scope remains pending;
do not invent a gitlink or bypass private defaults to close it.
