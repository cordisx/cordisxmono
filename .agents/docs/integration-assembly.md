# Integration assembly checkpoint

Use this checkpoint before cross-repository integration or a same-port switch.
It proves which code, entries, configuration, and process are about to be
tested. It does not start, stop, restart, relink, clean, or roll back anything.

Copy [`assembly-manifest.v1.template.json`](../../integration/assembly-manifest.v1.template.json)
to a temporary location, replace every placeholder, and run:

```sh
npm run check:integration -- /absolute/path/to/assembly.json
```

The command writes one JSON document to stdout. `PASS` includes normalized
evidence and elapsed milliseconds. `FAIL` includes only the first blocker code
and message. The manifest path must always be explicit.

## Version 1 fields

- `repositories` declares Protocol, Host, and each consumer checkout, exact
  commit/tree, and either `clean` or the exact intentionally dirty paths plus a
  reason. The validator requires the checkout itself to be the Git top level,
  so an uninitialized submodule cannot fall through to Mono.
- `entries` resolves the actual Host and consumer entry realpaths and requires
  each to remain inside its declared repository with the declared SHA-256.
- `configuration.requested` and `configuration.stableHome` are independent
  path/SHA-256 references. `effectiveSource` selects one; runtime permission
  provenance must name a validated effective literal binding. Generic RFC 6901
  bindings verify either a path, file URL, or literal at a config pointer. Every
  consumer entry requires an effective `entry` or `file-url-of-entry` binding,
  so a hashed stable-home file that still names an old checkout fails. A
  command-line fixture is therefore not silently treated as the stable-home
  source. The validator does not parse Host- or plugin-private schemas.
- `selection` records last-good and candidate code inputs. Candidate revisions
  must equal the checked-out repositories. Rollback is fixed to
  `report-code-inputs-only` while persistent facts are preserved; the validator
  never performs rollback.
- `runtime` records the expected port separately from HTTP readiness. A running
  declaration additionally verifies the sole listener PID, process owner, cwd,
  checked Host entry in its command, other command fragments, loopback
  URL/status, Host/consumer entries, and permission source. HTTP 200 alone
  cannot prove runtime provenance. `not-running` requires no listener and null
  process/HTTP declarations.
- `gates` references existing passing evidence for the checked-out SHA. The
  checkpoint does not rerun owner or release gates.

The default runtime inspector uses existing `git`, `ps`, and `lsof` commands and
Node.js filesystem/hash/loopback HTTP APIs. It has no package dependency and no
write path. Run it only in a trusted local integration checkout; manifest
configuration and process paths may reveal local directory names, so keep
time-specific assemblies temporary rather than committing them.

This is a pre-switch identity check, not another integration runtime, daemon,
port manager, state database, cleanup tool, or ordinary pull-request gate.

## Feedback cost

For a three-repository, two-entry, two-config running assembly, the equivalent
manual checklist contains at least 26 primitive reads: four Git identity/state
reads per repository, realpath/hash checks for each entry and config, and
port/PID/owner/cwd/command/HTTP observations. Those normally arrive in four
separate evidence groups. The version-1 fixture invokes the same checkpoint once
and completed its full CLI PASS case in about 0.53s on 2026-09-06, including
temporary repository setup. Every result reports its own `durationMs`; use that
value for current measurements rather than treating this dated fixture timing
as a performance guarantee.
