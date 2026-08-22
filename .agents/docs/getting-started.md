# Getting Started

Clone this workspace with `git clone --recurse-submodules` and work inside the repository that owns the desired change. The private `roadmap` submodule is skipped by default.

Authorized maintainers can opt in with:

```sh
git -c submodule.vendors/cordisx/roadmap.update=checkout submodule update --init vendors/cordisx/roadmap
```
