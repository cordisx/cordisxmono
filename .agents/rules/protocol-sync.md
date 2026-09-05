# Protocol Synchronization

Externally observable plugin-contract changes are specified and versioned in
`cordisx-protocol`. Host and consumer work may be developed in parallel, but
formal consumer delivery must use the provider's merged contract, preserving
documented compatibility and downgrade behavior.

Follow the Protocol repository's rules for contract changes and
[cross-repo-changes.md](cross-repo-changes.md) for formal handoff and integration.
Keep implementation details in the Host or plugin reference that owns them.
