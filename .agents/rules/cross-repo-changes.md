# Cross-Repository Changes

Use this rule for dependent changes and every formal Mono pointer update,
including single-owner tasks that do not activate responsible manager mode.
Initial repository registration also follows
[repository onboarding](repository-onboarding.md): validate admission separately
from product compatibility, and do not refresh existing pointers incidentally.

1. Identify owners, dependencies, and the required compatible-set checks before
   changing dependent code. Develop in the owning repositories.
2. For externally observable contracts, follow
   [protocol-sync.md](protocol-sync.md). A consumer uses the provider's exact
   formal merge through its normal dependency mechanism and bases its branch on
   its own repository's main.
3. Push and formally merge owner changes first. Fetch each relevant remote and
   verify that the candidate SHA is on its canonical `origin/main`; an already
   verified older mainline commit may remain pinned. A pushed feature head is
   only an explicitly labeled experimental input, never a formal Mono baseline.
4. Assemble the exact merged revisions and run the checks appropriate to the
   change. Record each owner SHA and the scope and result of validation. Complete
   any user acceptance required by the assignment.
5. One designated integrator updates gitlinks in a separate final Mono commit,
   inspects the submodule diff, and reads back remote main after an authorized
   merge. Do not race other tasks to update the pointers.

Synchronizing a checkout to existing gitlinks does not upgrade the compatible
set. Neither this workflow nor a local successful check grants unrequested
release, deployment, or merge authority.
