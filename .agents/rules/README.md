# Workspace Rules

- Mount repositories at `vendors/<org>/<repo>`.
- Do not place product code in CordisXMono.
- Keep every submodule pinned to an exact commit.
- Keep private repositories registered with `update = none` so public clones skip them by default.
- Push changes to the owning repository before updating its pointer.
- Coordinate protocol and implementation updates explicitly.
- Treat repository-specific `AGENTS.md` and `.agents/rules` as authoritative inside each submodule.
