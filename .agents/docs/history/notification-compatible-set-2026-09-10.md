# Notification compatible set — 2026-09-10

The notification task owns this integration. The user authorized source merges
for the notification API, card interaction, plugin migrations and authoring
requirements. Product behavior remains in the [Host notification guide](https://github.com/cordisx/cordisx/blob/3cfe370eb7abf33e16686fbd82659cd441247fbd/.agents/docs/notifications.md)
and each plugin's AGENTS/notification guide. This record supersedes the
[development candidate record](notification-candidate-set-2026-09-10.md).

| Owner    | Selected formal revision                   | Merge evidence                                                                                                                   |
| -------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Protocol | `f46dd21e15a949a26f05f89bf11dea339fc60c02` | [PR 137](https://github.com/cordisx/cordisx-protocol/pull/137)                                                                   |
| Host     | `43f1d1896422a94a9aea3ea1f5762e449ca29814` | [API PR 392](https://github.com/cordisx/cordisx/pull/392), [default bundles PR 393](https://github.com/cordisx/cordisx/pull/393) |
| Channel  | `d426ec0a7a907746bc62317269a0ec5b3379adf9` | [PR 5](https://github.com/cordisx/plugin-channel/pull/5)                                                                         |
| Chatroom | `0878c4d4ae16541a711c984db261808a8dad2b56` | [PR 84](https://github.com/cordisx/plugin-chatroom/pull/84)                                                                      |
| CLIProxy | `5857dac38a1d3d0f0a45b43150fe69b92321dab4` | [PR 4](https://github.com/cordisx/plugin-cli-proxy-api/pull/4)                                                                   |
| Pet      | `c228f5ab6e232fe1ab4aba81bb23f53b4118b5b9` | [PR 8](https://github.com/cordisx/plugin-pet/pull/8)                                                                             |

The four plugins use the normal Git dependency flow with Host API revision
`3cfe370eb7abf33e16686fbd82659cd441247fbd`. The later Host bundle-source update
does not change that API and does not require another consumer pin update.
Default Channel and CLIProxy aliases must use their newly merged plugin sources;
merging only the plugin repositories would leave the older built-in UI bundled.

## Verification provenance

- Protocol PR 137 passed conformance, packed consumer/distribution, lint and
  formatting after adding the missing notification package inventories.
- [Host API CI](https://github.com/cordisx/cordisx/actions/runs/34390897718) passed
  the complete gate at `667bc53109c7dadb077bbe8356f47dd05b390483`. Its squash
  merge `3cfe370eb7abf33e16686fbd82659cd441247fbd` has the same Git tree
  `fa2e660af6f1360a912fca170da70051342fd83d`. Earlier failures are historical,
  not unresolved failures on this final API head.
- [Channel CI](https://github.com/cordisx/plugin-channel/actions/runs/34395694405),
  [CLIProxy CI](https://github.com/cordisx/plugin-cli-proxy-api/actions/runs/34395716523)
  and [Chatroom CI](https://github.com/cordisx/plugin-chatroom/actions/runs/34395769757)
  passed their final feature heads. Channel/CLIProxy push and PR jobs use the
  same check definition; the passing exact-head results were reused.
- Pet has no CI workflow. Its owner check passed all 141 tests on the same
  notification implementation and provider tree. The final metadata change
  replaced the provider feature SHA with its identical-tree formal merge;
  manifest/lock agreement and documentation were checked without another install.
- The prior isolated native notification smoke covers the API/card interaction
  described in the candidate record. No new native App or browser run is claimed
  for this merge. No user application was restarted.
- [Host bundle CI](https://github.com/cordisx/cordisx/actions/runs/34396501174)
  passed its own complete gate, including new bundled inputs and installed aliases,
  at `bee8788153e4968a9146a248d819468d5b182487`. Its formal merge
  `43f1d1896422a94a9aea3ea1f5762e449ca29814` preserves Git tree
  `70cd73f061de700963d3548fdfd96298abd08f7a`.
- The six-repository read-only assembly checkpoint passed in 313.59 ms. It
  checked exact commits/trees, clean owner worktrees, compiled entry hashes,
  explicit temporary configuration bindings and an unused port. This was a
  not-running assembly, not a new App session or the user's live configuration.

CI ran on the PR heads named in its linked evidence. Squash merge identities
were read back separately; identical-tree comparisons are provenance evidence,
not a claim that the old report executed on a new commit SHA.

## Delivery boundary

Game Room and Economy notification changes remain on their business stacks.
Those stacks contain substantial preceding work not selected for this merge;
this record neither merges that work nor admits the repositories to Mono.
Other Mono gitlinks remain unchanged. This source integration does not publish
an npm package, change a release/marketplace artifact or replace the running App.
