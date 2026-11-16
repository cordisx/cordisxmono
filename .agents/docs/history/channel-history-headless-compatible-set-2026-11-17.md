# Channel history and headless compatible set — 2026-11-17

This record covers the coordinated Channel history, sender identity, and
standalone service release after the [first-wave baseline](channel-first-wave-compatible-set-2026-11-17.md).

## Host source

The selected Host and Creator source is canonical commit
`9b47e436e4e4194db437514855091d621519308b` (tree
`da80f7c7ac40cebd5432b57d42730fc67973efbf`), containing
[headless service PR 603](https://github.com/cordisx/cordisx/pull/603) and
[history and sender PR 601](https://github.com/cordisx/cordisx/pull/601).
Both final pull-request heads passed their complete Host checks:
[headless](https://github.com/cordisx/cordisx/actions/runs/43967555820) and
[combined release candidate](https://github.com/cordisx/cordisx/actions/runs/43970535641).
The source specifies Host/Creator beta.68, Protocol beta.15, and the exact
Channel source revision below.

The exact canonical [Host main Check](https://github.com/cordisx/cordisx/actions/runs/43973399907)
passed its complete tests, native helpers, package, and installed-package gates.
Its Host release-candidate archive has SHA-256
`301e055a3795afb3164525f20b0fe1fe9d7cb710286d074111ada12271aa8fc0`.
The [beta.68 release workflow](https://github.com/cordisx/cordisx/actions/runs/43973470833)
completed its registry readback and clean installation checks. Both published
packages reported the selected Host commit and matched their candidate archives.

## Published Channel and Protocol inputs

Protocol `@cordisx/protocol@0.1.0-beta.15` was published at canonical commit
`dad40907144bda0c431abb9bddee91b8b30141d3` (tree
`74865cdb23f19ca9eeac80cacd9d93ce54c9d554`). Its [release workflow](https://github.com/cordisx/cordisx-protocol/actions/runs/43962430926)
passed on attempt 2 after the first registry visibility check returned 404.

The [Channel 0.1.4 release](https://github.com/cordisx/plugin-channel/releases/tag/v0.1.4)
is tagged at canonical commit `453a110a1eb5c21956e20f36b3af428b7bcffd71`
(tree `1390fef754fcd8238168fdd159980df239c41950`). Its downloaded archive
matched the published SHA-256
`e2bece3d50eefecb6fca47dbc89abf1a7e76aee2c314940ba6c7912a39863bac`.
The selected source passed its [main Check](https://github.com/cordisx/plugin-channel/actions/runs/43967111174).

Marketplace canonical commit `e3a815f37d3defe3bdd932aa58044a30602ea087`
(tree `e6d09df4f5192470bd8785a3d6e20a3f0382f6db`) selects the Channel 0.1.4
archive and digest above, with Host compatibility `>=0.1.0-beta.68 <0.2.0`.
Its [main Check](https://github.com/cordisx/marketplace/actions/runs/43977789381)
passed and the default raw catalog read back the same version and digest.

The read-only integration assembly passed with these exact Host, Protocol, and
Channel commits and trees. Its Host entry came from the main Check candidate;
its Channel service matched the downloaded release archive. Configuration was
synthetic and the declared runtime was not running, so this is an identity
checkpoint rather than a live application test.

## Real validation scope

In the designated test enterprise, private and group messages on an earlier
development composition reached a local task with sender identity. The Agent
read two distinct pages of remote history, sent one explicit Channel CLI reply,
and checked the same-turn delivery receipt; each reply was visible once in the
browser. A prior group turn failed because that session retained an unsupported
model; that failure remains distinct from the later successful retry.

The headless owner's independent real app-server probe reproduced a failed turn
in `systemError`, then used the corrected model selection path and native readback
to complete the next turn in the same process without restart. The prior group
failure did not retain its raw native state, so this probe does not establish
that the two failures had the same cause. These tests used development inputs,
not a claim that the final published package was itself live-tested.

## Local installation and runtime boundary

The ordinary `cordisx` command was switched to a separately installed beta.68
package after all 4,745 package files matched the published candidate archive.
The bundled Channel package reports version 0.1.4 and the selected source;
its service entry matches the independently downloaded Channel archive.

The existing default App remained ready on beta.63 with the same process and
runtime generation. Its four previously active plugins retained their versions,
digests, module generations, and active state. Channel was not configured or
active in that running default profile. Since plugin management targets the
active profile runtime, activation remains a separate step after the user exits
the old App and starts the updated Host; this record does not call it pending
activation or imply that the existing window loaded beta.68.
