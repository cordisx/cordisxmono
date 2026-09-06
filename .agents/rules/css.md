# CSS ownership and maintenance

Read this rule before changing CSS, SCSS, Sass, Less, stylesheet-generating
code, or a component's style-bearing DOM contract. The owning repository keeps
product-specific selectors and visual decisions; this organization rule owns
the cross-repository maintenance boundary.

## Find the owner before editing

Identify the product surface that owns the rendered DOM, its stylesheet entry,
and the actual load order before changing a selector. Record the component or
page, state attributes and classes, theme inputs, responsive breakpoints, and
portal or overlay roots affected by the change. A similarly named selector in
another plugin or preview is not evidence that it owns the production surface.

Host-owned chrome, routing, forms, accessibility and native surfaces keep their
styles in Host. Plugins may style only plugin-owned presentation within their
declared surface. Do not use plugin CSS to override Host or native DOM, and do
not move product CSS into Mono.

## Split by product responsibility

A stylesheet module owns one cohesive product area. Keep a component's base,
interactive states, responsive variants, reduced-motion behavior and animations
together. Useful boundaries include a page, feature, component family, overlay,
or stable foundation layer.

Keep the dependency direction explicit:

```text
tokens -> foundation -> feature -> feature states and variants
```

Feature styles may consume shared tokens and primitives. Foundation files must
not depend on feature selectors. Two features must not coordinate by overriding
each other's internal classes. Promote only a genuinely shared semantic token
or primitive; repeated declarations alone do not justify a shared abstraction.

Avoid `misc.css`, numbered parts, one global responsive file, or one global
animation file. Those files recreate the central edit point. Do not split one
selector across unrelated files merely to satisfy a line count.

## Treat the cascade as a contract

Preserve and review stylesheet load order, cascade layers, selector specificity,
custom-property ownership, inheritance, portal roots and state precedence.
Prefer an explicit layer or import order over relying on a later rule to win by
accident. Avoid new `!important` declarations and broader global selectors as a
shortcut around an ownership problem.

Moving rules is a behavior change when their relative order changes. Verify the
computed result for overlapping states such as hover plus disabled, open plus
loading, light plus responsive, or motion plus reduced motion.

## Size and tool responsibilities

- Repositories with maintained styles must configure dprint with Malva for CSS,
  SCSS, Sass and Less formatting.
- Repositories with maintained styles must configure Stylelint for stylesheet
  syntax, invalid patterns, selector complexity and maintained stylesheet size.
  Use the standard `projectwallace/max-lines-of-code` rule at 1000 instead of a
  repository-specific line counter. Keep formatting rules out of Stylelint.
- At 800 lines, stop adding another responsibility and record the next cohesive
  extraction boundary in the task or PR.
- A maintained stylesheet above 1000 lines must be split before merge. Do not
  compress declarations, remove explanations, raise the limit or add a blanket
  ignore to pass.

Generated assets, dependency output and pinned third-party snapshots do not use
the maintained-source size rule. Their owner must instead verify the generator,
upstream version, license, integrity and reproducibility. A handwritten product
stylesheet cannot be relabeled as generated or vendor code to avoid governance.

## Verification

Format and lint every changed stylesheet through the owner repository's native
commands. Check the stylesheet entry and import graph so a new file is actually
loaded and covered. Test the states and breakpoints affected by the change,
including keyboard focus, theme variants and reduced motion where applicable.

For a pure extraction, compare the ordered CSS rules before and after or provide
equivalent deterministic evidence that declarations, media conditions and
keyframes were preserved. For a visual change, verify the real owning surface;
a formatter, source readback or isolated fixture is not visual acceptance.

In the PR, name the owning surface, old and new module boundaries, load-order
decision, before/after line counts, checks run, and any visual acceptance still
required. Follow [formatting and file size](file-size.md) and the
[splitting guide](../docs/splitting-files.md) for the shared engineering rules.

References: [dprint Malva](https://dprint.dev/plugins/malva/),
[Stylelint configuration](https://stylelint.io/user-guide/configure/), and
[Project Wallace Stylelint rules](https://github.com/projectwallace/stylelint-plugin#rules).
