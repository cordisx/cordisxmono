# Getting started

## Clone

```sh
git clone --recurse-submodules https://github.com/cordisx/cordisxmono.git
cd cordisxmono
```

The private `roadmap` submodule is skipped by default. Read the root `AGENTS.md`
and use the [ownership table](organization-context.md#repository-ownership) to
find the repository that owns your work.

## Synchronize the committed compatible set

Inspect changes in the Mono checkout and initialized submodules first:

```sh
git status --short --branch
git submodule foreach 'git status --short --branch'
```

If any repository is dirty, preserve its work and resolve the next step before
switching revisions. Do not reset another task's work or shared preview.
For a clean integration checkout:

```sh
git fetch origin
git merge --ff-only origin/main
git submodule sync --recursive
git submodule update --init --recursive
```

This works on a clean main branch or detached integration checkout when a
fast-forward exists. If history diverged, stop and inspect it. An active feature
branch needs its own rebase or merge plan rather than this synchronization recipe.

Submodule update checks out the commits recorded by Mono, usually with detached
HEADs. It does not select every owner's latest main. Avoid `submodule update
--remote` when synchronizing the recorded set. To inspect available upstream
changes, fetch the relevant owner and compare its main with the pinned commit.

## Start an owner change

Read the owning repository's `AGENTS.md` and rules. From its clean checkout,
create a branch using an appropriate, unused task name, for example:

```sh
cd vendors/cordisx/cordisx
git fetch origin
git switch -c codex/my-change origin/main
```

Record that owner baseline. While developing, Mono may show that submodule as
modified because its checkout differs from the committed gitlink. Do not stage
that pointer as part of unrelated Mono documentation work. Formal pointer
upgrades follow [cross-repository changes](../rules/cross-repo-changes.md) after
owner merges and compatible-set verification.

## Private planning opt-in

Authorized maintainers can initialize the private planning checkout with:

```sh
git -c submodule.vendors/cordisx/roadmap.update=checkout submodule update --init vendors/cordisx/roadmap
```

Keep `update = none` in `.gitmodules`; this per-command opt-in does not change
the public clone policy.
