# Register and audit repositories

This is the maintainer runbook for the
[repository onboarding rule](../rules/repository-onboarding.md). Use Git and
Python 3 for the offline checks; online reconciliation additionally uses `gh`
with the maintainer's existing authorized access. It never changes permissions.

## Register the formal owner revision

Start in a clean, isolated Mono branch from freshly fetched `origin/main`.
Inspect other tasks' ownership first; preserve their dirty work and previews.
Read the owner rules before any product edit. Registration itself needs no
product changes. Inspect canonical metadata, for example:

```sh
gh api repos/cordisx/plugin-chatroom --jq \
  '{full_name,clone_url,visibility,default_branch,archived,fork}'
git ls-remote https://github.com/cordisx/plugin-chatroom.git refs/heads/main
```

For a confirmed public repository, add its mount and verify the selected commit.
The example selects the observed formal main; use the remotely confirmed default
branch if it differs. Stop on a changed or missing ref and reconcile the evidence.

```sh
git submodule add https://github.com/cordisx/plugin-chatroom.git vendors/cordisx/plugin-chatroom
git -C vendors/cordisx/plugin-chatroom fetch origin main
git -C vendors/cordisx/plugin-chatroom rev-parse origin/main
git -C vendors/cordisx/plugin-chatroom switch --detach origin/main
git -C vendors/cordisx/plugin-chatroom rev-parse HEAD 'HEAD^{tree}'
git -C vendors/cordisx/plugin-chatroom merge-base --is-ancestor HEAD origin/main
git ls-remote https://github.com/cordisx/plugin-chatroom.git refs/heads/main
```

Add its `org/repo`, public/private visibility, maintenance role and purpose to
the [ownership table](organization-context.md#repository-ownership). Do not add a
`branch` field in `.gitmodules`. For private admission, use an authorized clone
only and set `update = none` before staging; do not put tokens in clone URLs.
The existing [private opt-in](getting-started.md#private-planning-opt-in) is the
per-command pattern for authorized initialization, with the relevant mount name.

```sh
git add .gitmodules .agents/docs/organization-context.md vendors/cordisx/plugin-chatroom
python3 scripts/check-repositories.py
python3 -m unittest discover -s scripts -p 'test_*.py'
git diff --cached --check
git diff --cached --submodule=log
```

The default validator reads the inventory, `.gitmodules`, and gitlinks from the
same Git index snapshot. Stage all registration inputs before running it;
unstaged edits are not checked. To check one committed snapshot without mixing
staged or working files:

```sh
python3 scripts/check-repositories.py --revision HEAD
```

Neither mode fetches, initializes submodules, needs a private token, nor verifies
remote visibility or mainline reachability. CI runs the offline checks on pull
requests and main. A matching checkout is not required for an uninitialized
submodule; mode `160000` and its exact object ID come from Git.

## Anonymous public clone/init

After pushing the candidate branch, test in a fresh disposable directory with
global/system Git configuration, credential helpers, extra headers and prompting
disabled. Use a runner without automatic `.netrc` credentials. This avoids
using private credentials or existing submodule configuration. Replace the
branch and expected revision with the exact PR candidate. Do not copy private
contents into the test. Keep existing user/global configuration unchanged.

```sh
probe=$(mktemp -d)
env -u GH_TOKEN -u GITHUB_TOKEN -u GIT_CONFIG_COUNT -u GIT_CONFIG_PARAMETERS \
  GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null \
  GIT_TERMINAL_PROMPT=0 GIT_ASKPASS=/usr/bin/false \
  git -c credential.helper= -c http.extraHeader= clone --recurse-submodules --branch codex/repository-onboarding \
  https://github.com/cordisx/cordisxmono.git "$probe/mono"
git -C "$probe/mono" rev-parse HEAD
git -C "$probe/mono" submodule status
python3 "$probe/mono/scripts/check-repositories.py" --repo "$probe/mono" --revision HEAD
```

Compare HEAD with the expected full candidate SHA. Expect every public mount at
its exact pin and private mounts to remain uninitialized (`-` status). Repeat
`submodule update --init --recursive` under the same credential-free environment
to exercise the existing-checkout path. This only verifies retrieval, not builds
or product compatibility. Keep the log and report failures; do not substitute
an authenticated clone for anonymous evidence.

## Reconcile organization inventory

The following is an explicit, read-only maintainer step, not a default CI gate:

```sh
gh api --paginate 'orgs/cordisx/repos?type=all&per_page=100' --jq \
  '.[] | {full_name,clone_url,visibility,default_branch,archived,fork}'
git config --file .gitmodules --get-regexp '^submodule\..*\.(path|url|update)$'
git ls-tree -r HEAD
git worktree list --porcelain
```

Compare every visible official repository to the ownership table, declarations,
and gitlinks. State the authenticated/public inventory coverage; inaccessible
private repositories cannot be certified absent. For relevant task checkout
paths, read `git -C <path> remote get-url origin` and the canonical remote
metadata. Normalize HTTPS/SSH and renamed aliases; count one identity once.
Do not recursively initialize private repos, scan their contents, mutate other
worktrees, or treat a local directory name as an official repository identity.

Record results in an indexed, dated history page using the
[exception fields](../rules/repository-onboarding.md#omission-audits-and-exceptions).
Keep private metadata to the already authorized public registration fields;
sanitized blockers belong in public records when disclosure is not authorized.

## Examples

| Observation                                                                       | Required result                                                              |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Public plugin has a merged main; owner, declaration and exact gitlink agree       | Offline check passes; anonymous clone and formal SHA evidence still required |
| Private roadmap is registered with `update = none` and has no local checkout      | Offline check passes; default public clone skips it                          |
| Plugin exists only in a separate task or `/tmp` clone                             | Admission incomplete; register the same canonical repository in Mono         |
| Ownership row or `.gitmodules` entry has no gitlink                               | Offline check fails; add the reviewed formal pin                             |
| A regular directory/blob replaces a gitlink, or a URL/path points to another repo | Offline check fails; correct the registration                                |
| Private registration omits `update = none`, or duplicate rows/paths appear        | Offline check fails; preserve skip policy and one canonical mount            |
| Two worktrees resolve to the same canonical origin                                | One repository, not two new mounts                                           |
| Product dependencies differ from existing Mono pins                               | Report the gap for integration; registration does not authorize an upgrade   |
