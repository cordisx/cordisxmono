# Context threshold continuation compatible set — 2026-11-18

This record covers the merged and published context-threshold continuation
release, its exact source/package assembly, and the local CLI update.

This set follows the [Channel history and headless baseline](channel-history-headless-compatible-set-2026-11-17.md).
Product semantics remain in the [Host continuation reference](https://github.com/cordisx/cordisx/blob/d5d7eaac45553456a6e4117c25f03a47c5ac2ca3/.agents/docs/context-threshold-continuation.md)
and the [Protocol context contract](https://github.com/cordisx/cordisx-protocol/blob/a474700a998ca4fe2a61eba2776dbcdfebdb7fa6/.agents/docs/agent-context/README.md).

## Exact owner inputs

| Owner              | Canonical revision                         | Delivery                                               |
| ------------------ | ------------------------------------------ | ------------------------------------------------------ |
| Host and Creator   | `d5d7eaac45553456a6e4117c25f03a47c5ac2ca3` | beta.69 published and installed CLI                    |
| Protocol           | `a474700a998ca4fe2a61eba2776dbcdfebdb7fa6` | beta.16 source plus release-verifier maintenance       |
| Channel            | `9e911c63ee8dc43518435490f39cbf7333c9d688` | 0.1.5 published source                                 |
| Public Marketplace | `7fffb4e4fc48676e935e515185083fe5ac5ad09d` | Channel 0.1.5 with compatible Host lower bound beta.69 |

Host product [PR 609](https://github.com/cordisx/cordisx/pull/609) merged at
`b2ffb3a03b660be03a6a66c1907cf001f5f6df14`. Its complete canonical
[main Check](https://github.com/cordisx/cordisx/actions/runs/44153371154)
passed on attempt 2. The first browser group failed while cleaning its temporary
Chrome profile with `ENOTEMPTY`; only that group and its aggregate were rerun at
the same commit. Other successful checks were retained. The release version
[PR 610](https://github.com/cordisx/cordisx/pull/610) passed its affected full
checks and produced the selected source. Its canonical
[release main Check](https://github.com/cordisx/cordisx/actions/runs/44156969241)
passed completely at the selected release source. The [trusted release
workflow](https://github.com/cordisx/cordisx/actions/runs/44160359425) also
completed provenance, registry readback and clean installation checks. Both
package beta tags resolve to beta.69; latest remains on the previous release.

Protocol beta.16 was published from `3856898cb77614a32f1e4ed5f07011984593fe0a`.
The later selected maintenance revision changes release verification only;
its public types, schemas and package metadata match the published revision.
The [release workflow](https://github.com/cordisx/cordisx-protocol/actions/runs/44122547021)
verified registry, provenance and clean installation, while selected-source
[full conformance](https://github.com/cordisx/cordisx-protocol/actions/runs/44125966696)
passed independently.

The [Channel 0.1.5 archive](https://github.com/cordisx/plugin-channel/releases/tag/v0.1.5)
has SHA-256 `cc0a1fecd2b1b0f7a14ba68f121ce3d7ff85bc2cfe912d3d1c342640ae6d21b9`.
The selected source passed its [full main CI](https://github.com/cordisx/plugin-channel/actions/runs/44123814797).
Its service and browser output were independently compared with the downloaded
release archive. The Host bundle pins the same source; its service output
matches, while its separately built browser output has a different digest.
A source rebuild is not assumed byte-identical to the independent artifact.

The selected Marketplace [main validation](https://github.com/cordisx/marketplace/actions/runs/44154138093)
passed. Its ordinary public raw URL and the default profile source refresh
read back Channel 0.1.5, its archive digest and Host compatibility
`>=0.1.0-beta.69 <0.2.0`.

## Assembly and real runtime scope

The read-only integration assembly passed using the four exact
owner commits and trees. Host outputs came from the canonical release main
package job; Channel outputs matched the independently downloaded archive.
Configuration was synthetic and the declared runtime was not running, so this
is a source/package identity checkpoint, not a live App test. The final checkpoint
reused complete canonical Host/Protocol/Channel/Marketplace evidence.

A separate native 0.167 app-server and Channel-handler probe observed a real
below-to-above transition, fresh target preparation, exact source interruption,
bounded catch-up and target business start. Channel input was simulated and
execution preferences used a test stub.

A production HeadlessService then used actual execution preferences, existing
shared authentication roots, published Channel 0.1.5 files and one real Feishu
group input sent from the signed-in browser. The initial test encountered an
archived binding; after bounded recovery, a low threshold exposed repeated
initial-above handoffs. The dedicated service was stopped before any outbound
message and that defect was corrected in PR 609.

On the corrected candidate, one explicitly marked manual-recovery job reused
the same persisted input. The production consumer handed the work off once,
confirmed source interruption, read history and final catch-up, restored the
target's actual execution settings and completed its business turn. The Agent
called Channel CLI and obtained a same-turn sent receipt. The outbox contained
one sent entry with one attempt; the browser showed one expected robot reply.
An initial identical CLI command failed before submission because Host process
identity could not be verified; the subsequent command succeeded. The specific
OS inspection difference remains unproven. This is not an unattended,
first-attempt acceptance claim, and no duplicate inbound message was sent.

The dedicated receiver was stopped, all five owned test chats were archived
and read back, and original bindings and defaults were restored. The ordinary
App and unrelated gateway retained their processes. Real Desktop renderer
acceptance is not established by the headless test.

## Local delivery and activation boundary

The local `cordisx` command now resolves to the separately installed beta.69
package. Both Host and Creator downloaded registry archives matched the
canonical main Check candidate bytes. The installed Host package was compared
with those package files, and CLI help executed successfully. The bundled
Channel package reports 0.1.5 and the selected source revision. Its service
entry matches the independently published Channel archive; its browser entry
matches the separately built Host package.

The existing ordinary App remains ready on beta.63. Its process and runtime
generation, four active plugins, their versions, digests and module generations
were preserved. Channel is not installed or active in that default plugin list.
The Channel bundle is present on disk with the CLI, which does not establish a
profile installation or activation. Ordinary plugin management targets that
active older runtime, which is below the catalog's beta.69 compatibility floor.
No unsupported pending queue, activation-store rewrite or App restart was used.

The independently released private Model Services 0.1.7 artifact and its
CDN/feed update are complete. The ordinary runtime remains active on 0.1.6:
two supported update attempts failed at the old Host's download timeout.
Updating the CLI alone does not replace the running Host or its plugin.

This compatible set records publication, source integration and local package
installation. It does not claim real Desktop renderer acceptance, active
Channel installation in the preserved window, or user acceptance of that
new runtime. Product/runtime limitations remain in the owning references.
