# Documentation ownership and layers

Use this rule when adding, changing, moving, or retiring project documentation.
The [organization ownership table](../docs/organization-context.md#repository-ownership)
identifies the owning repository. Each owner indexes its own document layout.

## One authoritative home

- Mono owns organization context, cross-repository workflows, and compatible
  revision records. Link to product and protocol references instead of restating
  their API inventory, implementation status, or launch instructions here.
- Protocol owns implementation-independent compatibility requirements. Host
  references explain implementation and link to the applicable protocol version.
- Product and plugin owners keep their guides beside the product. Package,
  example, and Skill instructions may stay beside the artifact they describe.
- The docs site owns navigation and publication behavior; the homepage owns its
  shared visual design and capture workflows. They link to source material.
- Private or provisional planning stays in roadmap. Promote settled facts to
  their owner and record the destination; do not create a second maintained copy.

## Separate purpose and status

| Kind | Content and scope |
| --- | --- |
| Repository entry | `README.md` serves readers; `AGENTS.md` routes work to the applicable owner rules and guides. Keep both short enough to find the next step. |
| Maintenance rule | `.agents/rules` contains durable instructions, with a trigger and scope. Temporary task assignments do not belong here. |
| Public guide or reference | The owner's `.agents/docs` explains usage, architecture, or versioned semantics. Identify the audience and authoritative topic links. |
| Maintainer runbook | Keep repository release or recovery operations in an indexed maintainer guide, separate from normative public contracts. |
| Decision or historical record | Label accepted decisions, dated observations, and superseded plans explicitly. Record the applicable version, date, and replacement link when known. |

Protocol maturity, implementation, validation, merge, and user acceptance are
different facts. A document on main may still describe an experimental contract
or a historical observation. Do not infer completion or acceptance from its
location. Historical instructions must be marked non-operative; current task
ownership belongs in the task handoff rather than a permanent product reference.

An architecture overview owns the system map and invariants. Keep detailed API
and delivery status in the indexed topic that owns them. Short entry-point
summaries are useful when they link to that source instead of maintaining a
second specification or operational recipe.

## Verify documentation changes

1. Update the owner index and inbound links when adding or moving a page. Preserve
   published paths or anchors with a navigation stub when needed.
2. Check relative links against tracked source and newly added files. Check a
   version index against the actual specifications and public exports it names.
3. Run `git diff --check`. For documentation-only changes, review links, examples,
   claims, and navigation; do not add product tests solely to mirror prose.
4. Run owner-required checks when the edit also changes behavior, executable
   examples, generated artifacts, or publication configuration. State the scope
   of the evidence; link validation is not product or real-App verification.
