# Protocol Synchronization

Externally observable plugin-contract changes are specified and versioned in
`cordisx-protocol`. Host and consumer work may be developed in parallel, but
formal consumer delivery must use the provider's merged contract, preserving
documented compatibility and downgrade behavior.

Follow the Protocol repository's rules for contract changes and
[cross-repo-changes.md](cross-repo-changes.md) for formal handoff and integration.
Keep implementation details in the Host or plugin reference that owns them.

## Diagnose dependency differences before aligning versions

Different package versions or Git commits are not, by themselves, a compatibility
failure. Exact pins establish reproducibility; compatibility follows the public
contract and the actual resolved dependency graph. Preserve compatible older
revisions when the task does not require upgrading them.

For a version-consistency failure, inspect the assertion and the relevant changes
first. Distinguish missing APIs, incompatible contracts, or required shared type
or runtime identity from harmless revision differences or stale bookkeeping.
Fix the dependency when a real requirement is unmet. If an equality assertion
is stricter than the supported contract, correct the owning check with focused
evidence instead of forcing every consumer onto one revision. Do not simply
ignore a failing required CI check; resolve its premise and report the result.

Use the [risk-tiered gates](risk-tiered-gates.md) to select validation and reuse
CI evidence. Version alignment alone is not a reason to rebuild every repository.
