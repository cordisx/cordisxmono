# Workspace Rules

- Mount repositories at `vendors/<org>/<repo>`.
- Do not place product code in CordisXMono.
- Keep every submodule pinned to an exact commit.
- Keep private repositories registered with `update = none` so public clones skip them by default.
- Follow the formal owner-merge and compatible-set requirements in
  [cross-repo-changes.md](cross-repo-changes.md) before updating pointers.
- Treat repository-specific `AGENTS.md` and `.agents/rules` as authoritative inside each submodule.
- Follow [formatting and file size](file-size.md): dprint owns formatting,
  ESLint enforces the source-file limit, and 800 lines prompts a design review.

## Read by task

| Task                                                        | Required guide                                                                          |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Find the owning repository or begin organization work       | [Organization context](../docs/organization-context.md)                                 |
| Synchronize an existing checkout or start an owner branch   | [Getting started](../docs/getting-started.md)                                           |
| Create, transfer, adopt, or audit organization repositories | [Repository onboarding](repository-onboarding.md)                                       |
| Add, reorganize, or update documentation                    | [Documentation ownership and layers](documentation.md)                                  |
| Format, lint, or expand a file                              | [Formatting and file size](file-size.md), [splitting guide](../docs/splitting-files.md) |
| Change a public contract                                    | [Protocol synchronization](protocol-sync.md), then owner rules                          |
| Change dependencies or Mono gitlinks                        | [Cross-repository changes](cross-repo-changes.md)                                       |
| Coordinate an authorized release                            | [Release coordination](release-coordination.md)                                         |

Read the owner repository's instructions before edits. Use these links to load
the relevant workflow; ordinary tasks do not require the full manager workflow.

## Responsible work manager mode

When the user explicitly asks Codex to act as the responsible manager, lead,
chief coordinator, or owner for work performed across multiple Codex tasks,
read `.agents/docs/work-manager.md` and `.agents/rules/owner-reporting.md`
completely and use those workflows. Chinese
requests such as “你来负责”, “替我管理这些工作”, or “做总协调” activate the
mode when they delegate ongoing coordination, not merely implementation. The
same applies to “帮我管理这些会话并最终交付”.

For repeated user-led styling feedback on an existing preview, follow the
user-led pure-style iteration window in `.agents/docs/work-manager.md`.

Do not activate the mode for a normal single-owner change, a read-only status
check, or a one-time request to compare or summarize tasks. The mode coordinates
authorized work; it does not authorize creating tasks, expanding scope, merging,
deploying, or performing other external changes that the user did not request.
