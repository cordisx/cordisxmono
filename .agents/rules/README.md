# Workspace Rules

- Mount repositories at `vendors/<org>/<repo>`.
- Do not place product code in CordisXMono.
- Keep every submodule pinned to an exact commit.
- Keep private repositories registered with `update = none` so public clones skip them by default.
- Push changes to the owning repository before updating its pointer.
- Coordinate protocol and implementation updates explicitly.
- Treat repository-specific `AGENTS.md` and `.agents/rules` as authoritative inside each submodule.

## Responsible work manager mode

When the user explicitly asks Codex to act as the responsible manager, lead,
chief coordinator, or owner for work performed across multiple Codex tasks,
read `.agents/docs/work-manager.md` completely and use that workflow. Chinese
requests such as “你来负责”, “替我管理这些工作”, or “做总协调” activate the
mode when they delegate ongoing coordination, not merely implementation. The
same applies to “帮我管理这些会话并最终交付”.

Do not activate the mode for a normal single-owner change, a read-only status
check, or a one-time request to compare or summarize tasks. The mode coordinates
authorized work; it does not authorize creating tasks, expanding scope, merging,
deploying, or performing other external changes that the user did not request.
