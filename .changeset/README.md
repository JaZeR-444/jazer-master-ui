# Changesets (dormant)

This scaffolds versioning/publishing for the publishable packages (`@jazer/ui`, `@jazer/tokens`,
`@jazer/styles`). It is **not active yet** — the "installable UI kit" vision is a later phase.

## Activate when you want to publish to npm

```bash
pnpm add -Dw @changesets/cli   # install the CLI at the workspace root
pnpm changeset                 # describe a change + bump
pnpm changeset version         # apply version bumps + changelogs
pnpm changeset publish         # publish (needs an NPM_TOKEN)
```

Then add a release workflow (`.github/workflows/release.yml`) using `changesets/action@v1`,
gated on the `NPM_TOKEN` secret. `@jazer/web` is ignored (it's an app, not a published package).
