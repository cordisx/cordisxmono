# Internal development feedback

Use this rule for CordisX repository development: Host, simulator/Playground,
plugins, and their integration previews. It governs the internal feedback loop,
not third-party plugin authoring. Mono owns cross-repository source/preview
coordination and evidence policy; each owning repository keeps its runtime
mechanisms and launch/debug runbooks. This rule does not expand task scope or
authorize Host-core changes, changes to another task, or external delivery.

## Choose guidance by the code being changed

- For plugin-owned code, including first-party plugins developed internally,
  read the plugin owner's rules and the applicable public plugin development
  guide/`cordisx-plugin-development` skill. Public API, Host UI ownership,
  permissions and lifecycle boundaries still apply. This internal rule adds
  source/preview coordination, capability-gap assessment and delivery
  discipline; it does not grant a private Host API or DOM fallback.
- For Host or simulator/Playground implementation, follow that owner's internal
  development guides. Plugin authoring instructions describe the consumer
  boundary, not the Host implementation workflow. Keep externally observable
  contract changes under [protocol synchronization](protocol-sync.md).
- For joint work, apply each guide to its owning code. A shared source-linked
  session does not erase the Host/plugin boundary.

## Evaluate missing capabilities

- For internally developed plugins, evaluate whether a capability gap warrants
  a new or extended public extension point. Do not stop at "unsupported" or
  assume the only next step is an external issue. Assess the common need across
  plausible plugins, existing capabilities, the smallest reusable contract,
  Host/plugin ownership, permissions, lifecycle and compatibility. Keep product
  behavior in plugins rather than encoding the requesting plugin into the Host.
- Record the proposed boundary and representative consumer scenarios, including
  where generalization is not justified. Avoid speculative APIs solely to claim
  reuse. Implement provider work within the authorized scope and follow
  [protocol synchronization](protocol-sync.md) and owner delivery rules; an
  internal capability assessment is not an automatic mandate to expand Host.
- For external plugin developers, the collaboration path may start with an
  issue describing the use case and capability gap for discussion and design,
  then a PR to propose or implement the extension with maintainers. This is not
  a blanket requirement to open an issue before every PR. Keep the detailed
  external contribution guidance in the owning public plugin documentation.
- Both paths use public contracts. Neither permits plugin-side private Host
  access as a substitute for a missing extension point.

## Feedback requirements

1. Before editing, identify the active preview, resolved source and
   config. If the edited and watched checkouts differ, record the synchronization
   destination in the task handoff and verify the change reaches it.
2. For active Host, simulator or plugin development, default to a supported
   source-linked session for the owners being edited. Use an installed candidate
   when package or exact-assembly verification is the next decision, or state
   the concrete source-mode blocker.
3. Use the existing session's supported update mechanism for iterative feedback.
   Before escalating to a process restart, identify the changed execution
   boundary or observed failure; "Host SDK changed" alone is not a reason.
4. Do not require commit, push, provider merge, production packaging or a fresh
   assembly before every reversible visual preview. Preserve the applicable
   [delivery gates](risk-tiered-gates.md), including package and clean-install
   evidence when required.
5. Verify the actual visible result and report the update mechanism and remaining
   defects. A build or HMR notification alone does not prove success; a restart
   workaround does not prove an HMR defect was repaired. Simulator/Playground
   evidence covers only the behavior it hosts; native claims need the owning
   runtime verification.

See the [development experience](../docs/ai-native-adaptive-development.md#keep-development-feedback-attached-to-the-running-source)
for rationale and update-boundary examples. Consult the owning repository's
internal guides for version-specific mechanisms, including the Host
[native debugging runbook](https://github.com/cordisx/cordisx/blob/main/.agents/docs/native-debugging-runbook.md)
and [documentation index](https://github.com/cordisx/cordisx/blob/main/.agents/docs/README.md).
