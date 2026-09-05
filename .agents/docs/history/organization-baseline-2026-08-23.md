# Organization baseline recorded on 2026-08-23

Status: historical, non-operative snapshot moved from the original organization
context. These settings, SHAs, and verification results describe that date only;
they have not been revalidated by this documentation reorganization. Use the
[current organization context](../organization-context.md) and fresh remote
evidence for new work.

Baseline captured on 2026-08-23:

- GitHub organization: `CordisX`
- Description: `A Cordis-powered UI plugin ecosystem for Codex Desktop.`
- Homepage: `https://cordisx.github.io/`
- Default repository permission: none
- Member repository creation: disabled
- `core` team: maintain access to every organization repository
- `security` team: triage access to every organization repository
- Merge policy: squash and rebase are enabled, merge commits are disabled, and
  merged branches are deleted
- Public `main` branches reject force pushes and deletion
- GitHub Pages: homepage and documentation deployments are built and return 200
- GitHub Actions: enabled for all organization repositories and actions

Pinned revisions at this baseline:

| Repository | Commit |
| --- | --- |
| `.github` | `cefd66a2ee87df4807c7c143e2031fea9ffe220f` |
| `cordisx` | `aeea1960ce4e7d15927c13ed64e60caae56d6945` |
| `cordisx-protocol` | `969774beb1a3e8056ba3876e8bf4b495fe587cd4` |
| `cordisx.github.io` | `be30a8955db2bb71776779684eb53443e54e33a1` |
| `docs` | `50905086f409b6de6c4753086e40e44204f9afa3` |
| `roadmap` | `d7221dd4646dd56a0e8c88434021f929902af71a` |

The implementation baseline has TypeScript/configuration/DOM lifecycle tests,
an isolated-launch path, real renderer injection evidence, and five DSH-aligned
slots. Treat that as a feasibility baseline, not as proof of compatibility with
future Codex releases.
