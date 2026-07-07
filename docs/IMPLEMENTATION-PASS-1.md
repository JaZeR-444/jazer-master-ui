# JaZeR V2 — Pass-1 Implementation Plan (Milestones 0→6)

> **Companion to:** [`ARCHITECTURE-V2.md`](./ARCHITECTURE-V2.md)
> **Scope:** the thin vertical slice — a **Button** proven through every pillar (tokens → SCSS →
> React → Next.js Hub → Flutter + SwiftUI → CI). Real architecture, narrow content.
> **Branch:** all work on `feat/v2-monorepo`, merged via PR after Milestone 6 is green.
> **Tooling targets:** Node ≥20.11, pnpm 9, Turborepo 2, Next.js 15 (App Router, React 19),
> Storybook 8 (Vite), dart-sass, Style Dictionary 4, Flutter 3.x, Xcode 15 (CI).

Each milestone ends with a **Checkpoint** (objective acceptance test) and a **Commit**. Do not start
the next milestone until the current Checkpoint passes.

---

## Milestone 0 — Monorepo skeleton & legacy move

**Goal:** turn the flat repo into a pnpm + Turborepo workspace; relocate legacy; shared config.

**Tasks**

- `0.1` `git checkout -b feat/v2-monorepo`
- `0.2` Move legacy out of root (preserves history, stops bracket-glob interference):
  `git mv "[HTML]" legacy/[HTML]` · `git mv "[CSS]" legacy/[CSS]` · `git mv "[JS]" legacy/[JS]`
  (root `index.html`, `favorites.html`, `jazer-brand.css` stay for now; superseded in M4.)
- `0.3` Root config files:
  - `package.json` → `private: true`, `"packageManager": "pnpm@9.x"`, `engines.node ">=20.11"`,
    scripts delegate to turbo: `dev/build/lint/test` = `turbo run <task>`.
  - `pnpm-workspace.yaml`:
    ```yaml
    packages:
      - 'packages/*'
      - 'apps/*'
    ```
  - `turbo.json`:
    ```json
    {
      "$schema": "https://turbo.build/schema.json",
      "tasks": {
        "build": { "dependsOn": ["^build"], "outputs": ["dist/**", ".next/**"] },
        "lint": {},
        "test": { "dependsOn": ["^build"] },
        "dev": { "cache": false, "persistent": true }
      }
    }
    ```
  - `.gitignore` += `node_modules/`, `.turbo/`, `dist/`, `.next/`, `apps/web/public/legacy/`.
- `0.4` `packages/config` (`@jazer/config`): `tsconfig.base.json`, `eslint-preset.js`
  (port `.eslintrc.json` rules + the whitelisted globals), `stylelint-preset`, `prettier` config.
  Move the existing root lint configs to extend these.
- `0.5` `pnpm install`.

**Checkpoint 0:** `pnpm turbo run lint` exits 0 (no packages yet); `git log --follow legacy/[JS]/modal-dialog.js`
shows full pre-move history; root `node_modules` linked by pnpm.

**Commit:** `chore: scaffold pnpm+turbo monorepo, relocate legacy/`

---

## Milestone 1 — Token pipeline spine

**Goal:** one token source → Style Dictionary → SCSS + CSS vars + `Theme.swift` + `jazer_theme.dart`.

**Tasks**

- `1.1` `packages/tokens` (`@jazer/tokens`): dep `style-dictionary@^4`; scripts `build`, `watch`,
  `check` (`build` then `git diff --exit-code` on generated outputs — the drift gate).
- `1.2` Author the **tiered** source (DTCG format, `$value`/`$type`, aliases `{color.cyan}`):
  ```
  src/primitives/  color.json  spacing.json  radius.json  typography.json  shadow.json
  src/semantic/    color.json   (color.bg = {color.surface.900}, color.accent = {color.cyan}, …)
  src/themes/      light.json   dark.json    (same semantic names → different primitives)
  ```
  Lift the actual values verbatim from `jazer-brand.css` (cyan `#00f0ff`, pink, purple, gradients,
  spacing scale, radii, fonts, shadows). **No new colors invented.**
- `1.3` `style-dictionary.config.mjs` with platforms:
  - `scss` → `_tokens.scss` (variables + deep maps) into `packages/styles/src/abstracts/`
  - `css` → `:root` custom properties + `[data-theme="dark"]` overrides
  - `ios` → custom format → `native/ios-swiftui/Sources/Generated/Theme.swift` (Color/Font ext.)
  - `flutter` → custom format → `native/flutter/lib/generated/jazer_theme.dart` (`ThemeData`+`JazerColors`)
- `1.4` Register the two custom formats (Swift, Dart) — small functions mapping token tree → source.
- `1.5` `pnpm --filter @jazer/tokens build`; confirm all four outputs land in their consumers.

**Checkpoint 1:** all generated files exist with correct JaZeR values; re-running `build` produces
**zero git diff** (idempotent — the contract holds).

**Commit:** `feat(tokens): token source + Style Dictionary → scss/css/swift/dart`

---

## Milestone 2 — SCSS design system (`@jazer/styles`), Button first

**Goal:** compile `jazer.css` from a layered Sass system; ship the `btn` BEM block.

**Tasks**

- `2.1` `packages/styles` (`@jazer/styles`): dep `sass`; scripts `build`
  (`sass src/main.scss dist/jazer.css --load-path=node_modules`), `watch`; exports `dist/jazer.css`
  and `./abstracts` partials (so `packages/ui` modules can `@use` mixins).
- `2.2` `abstracts/`: `_tokens.scss` (generated, M1), `_maps.scss`, `_functions.scss`
  (`spacing()`, `z()`, `fluid-type($min,$max)`), `_mixins.scss` (`responsive()`, `focus-ring()`,
  `theme()`), all via modern `@use`/`@forward`.
- `2.3` `base/`: `_reset.scss`, `_root.scss` (emits CSS custom props + `[data-theme="dark"]`),
  `_typography.scss`. `themes/`: `_light.scss`, `_dark.scss`.
- `2.4` `components/_button.scss`: the `btn` block — `btn--primary|secondary|ghost`, sizes,
  `:hover` / `:focus-visible` (uses `focus-ring()`) / `[disabled]`, all reading tokens.
- `2.5` `main.scss` — declare layer order once, assign partials to layers:
  ```scss
  @layer reset, base, layout, components, utilities;
  @use 'abstracts' as *; // functions/mixins/vars — emit nothing
  @layer reset {
    @use 'base/reset';
  }
  @layer base {
    @use 'base/root';
    @use 'base/typography';
  }
  @layer components {
    @use 'components/button';
  }
  @layer utilities {
    @use 'utilities/helpers';
  }
  ```
- `2.6` Build → `dist/jazer.css`; stylelint passes.

**Checkpoint 2:** a scratch HTML linking `jazer.css` with `<button class="btn btn--primary">`
renders the branded button; toggling `data-theme="dark"` on `<html>` re-themes it; `@layer`
declarations present in the compiled CSS.

**Commit:** `feat(styles): layered SCSS system (@layer) + btn block → jazer.css`

---

## Milestone 3 — `packages/ui` Button wrapper + Storybook 8

**Goal:** typed React `<Button>` applying BEM classes; Storybook catalog with a11y.

**Tasks**

- `3.1` `packages/ui` (`@jazer/ui`): peerDeps `react`/`react-dom`; dep `@jazer/styles` + `clsx`;
  build via `tsup` (esm+cjs+dts); tsconfig extends `@jazer/config`.
- `3.2` `src/Button/Button.tsx` — `forwardRef`, props `{ variant?, size?, fullWidth?, ...ButtonHTMLAttributes }`
  → `className={clsx('btn', variant && \`btn--${variant}\`, size && \`btn--${size}\`, fullWidth && 'btn--block', className)}`.
  Zero styles in TSX — classes only.
- `3.3` `src/Button/Button.stories.tsx` (CSF3): stories for each variant/size/state.
- `3.4` `src/index.ts` barrel export.
- `3.5` Storybook 8 + Vite in `packages/ui`: addons `a11y`, `interactions`, theme toolbar.
  `.storybook/preview.ts` imports `@jazer/styles/dist/jazer.css` and wires a `data-theme`
  light/dark global toolbar.
- `3.6` `pnpm --filter @jazer/ui build` → typed `dist/`.

**Checkpoint 3:** `pnpm --filter @jazer/ui storybook` runs; Button shows all variants in light+dark;
a11y addon reports no violations; `build` emits `.d.ts`.

**Commit:** `feat(ui): typed <Button> wrapper + Storybook 8 catalog`

---

## Milestone 4 — `apps/web` Next.js Hub + legacy + deploy

**Goal:** App-Router Hub renders `<Button>`, serves legacy, search/favorites skeleton, Vercel preview.

**Tasks**

- `4.1` `apps/web` via `create-next-app` (TS, App Router, **no Tailwind**). `next.config.js`:
  `transpilePackages: ['@jazer/ui', '@jazer/styles']`.
- `4.2` Root `layout.tsx`: import `jazer.css`; inline no-flash theme script (port idea from
  `add-immediate-theme.js`) setting `data-theme` from `localStorage` before paint.
- `4.3` Route groups + routes:
  ```
  (hub)/page.tsx                  landing + "/" command palette + favorites
  (showcase)/web/page.tsx         renders <Button> showcase (render + code + copy)
  (showcase)/foundations/page.tsx legacy index (links into /legacy/**)
  (showcase)/mobile/flutter/…     placeholder
  (showcase)/mobile/ios/…         placeholder
  (docs)/docs/page.tsx            tokens + usage
  ```
- `4.4` Legacy serving: `scripts/sync-legacy.mjs` copies root `legacy/` → `apps/web/public/legacy/`
  (gitignored), wired as `predev`/`prebuild`. Files open standalone at `/legacy/...`.
  _(Verbatim re-skin via `jazer.css` swap = later refinement; pass-1 = serve + link + index.)_
- `4.5` `src/registry.ts` typed component registry (Button + sample legacy entries) → drives search;
  `CommandPalette` React component (port `global-search.js` UX, `/` hotkey); `useFavorites` hook
  (port `add-favorites.js`, localStorage).
- `4.6` Vercel: link project, set Turbo build, deploy preview.

**Checkpoint 4:** `pnpm --filter web dev` → Hub loads; `/web` shows Button (light/dark); `/foundations`
opens a legacy file; `/` palette searches the registry; favorites persist; Playwright+axe smoke green;
Vercel preview URL live.

**Commit:** `feat(web): Next.js Hub + legacy serving + search/favorites` (+ `chore: vercel link`)

---

## Milestone 5 — Native slice (Flutter + SwiftUI Button)

**Goal:** prove the token pipeline reaches native — the same Button, themed from generated files.

**Tasks**

- `5.1` Flutter: `flutter create native/flutter`. Wire `lib/generated/jazer_theme.dart` (M1) into
  `ThemeData`; build a screen with a branded `JazerButton`; light/dark; `flutter analyze` clean +
  one widget test. (Runs on Windows: web/desktop/emulator.)
- `5.2` SwiftUI: author `native/ios-swiftui` (SwiftPM or `.xcodeproj`) **by hand on Windows** — add
  generated `Theme.swift`, a `JazerButton` `View` + `#Preview`, and one `XCTest`. No local build;
  verified in CI (M6).
- `5.3` `README.md` in each native dir (how to run/build).

**Checkpoint 5:** Flutter app runs on Windows showing a branded Button matching web; SwiftUI sources
complete and self-consistent (CI will compile them).

**Commit:** `feat(native): Flutter + SwiftUI Button from shared tokens`

---

## Milestone 6 — CI/CD (all pillars, macOS runner for iOS)

**Goal:** GitHub Actions verifying every pillar; the Windows constraint resolved by a macOS runner.

**Tasks**

- `6.1` `.github/workflows/web.yml`: pnpm+node setup → `turbo run lint build test` → upload Playwright report.
- `6.2` `tokens` job: `pnpm --filter @jazer/tokens check` (build + `git diff --exit-code` = drift gate).
- `6.3` `flutter.yml`: `subosito/flutter-action` → `flutter analyze` + `flutter test`.
- `6.4` `ios.yml`: `runs-on: macos-latest` → select Xcode → `xcodebuild build`/test the SwiftUI target.
- `6.5` Changesets: add `.changeset/config.json` + a `release.yml` **gated/dormant** (no publish
  without `NPM_TOKEN`).
- `6.6` Open the PR; (optional) branch protection requiring the four checks.

**Checkpoint 6:** PR shows **web + tokens + flutter + ios** all green and a Vercel preview attached.

**Commit:** `ci: web/tokens/flutter/ios(macOS) workflows` → then merge PR, tag `v2.0.0-slice`.

---

## After pass 1 — "add a component" loop

For each next component (Card, Input, Modal…): repeat **M2→M5** only:
SCSS block → typed UI wrapper + story → showcase entry → (optionally) native widget. The spine
(M0/M1/M6) is built once.

## Critical path & parallelism

```
M0 ──▶ M1 ──▶ M2 ──▶ M3 ──▶ M4 ─┐
                      └──────────┴──▶ M6
              M1 ──────────────▶ M5 ─┘   (native can start once tokens exist; CI lands last)
```

M5 (native) only depends on M1 (tokens) — it can proceed in parallel with M3/M4 if desired.

## Risk checkpoints baked in

- **Token drift** caught by M1.5 idempotency + M6.2 CI gate.
- **Cascade correctness** verified visually at M2 (layers in output).
- **a11y** gated at M3 (Storybook axe) and M4 (Playwright axe) — continuing your existing rigor.
- **iOS-on-Windows** de-risked at M6.4 (macOS runner compiles what you authored blind).
