# JaZeR Component Library — Architecture V2 (Design Spec)

> **Status:** Approved design — ready for implementation handoff
> **Date:** 2026-06-26
> **Author:** JaZeR (`contact@jazeratx.com`) with Claude Code (brainstorming facilitation)
> **Supersedes:** the current static vanilla HTML/CSS/JS architecture (V1)

This document is the validated output of a structured brainstorming session. It captures
**what** we are building, **why**, the **assumptions**, the **decision log** (with alternatives
considered), the **final architecture**, and the **first-pass build sequence**.

---

## 1. Understanding Summary

- **What:** Rebuild the JaZeR Component Library from a static vanilla HTML/CSS/JS reference
  (~2,057 files: 388 `[HTML]`, 1,524 `[CSS]`, 145 `[JS]`) into a **professional, multi-platform
  monorepo** that is simultaneously a **design system**, a **deployed showcase/Hub**, an eventual
  **full-stack product**, and a set of **installable packages** — the four visions as four folders
  of one repo, not four separate projects.
- **Why:** Deliberately level up from "level 1" to "level 5–6" by practicing **senior full-stack /
  architect** skills, and to produce one cohesive, deployable, portfolio-grade artifact spanning
  **web *and* mobile**.
- **Who:** Primarily the author — as builder/learner and first consumer of the design system.
  Secondarily a public audience (portfolio viewers; developers who learn from / copy components).
- **Platform pillars:** Web (React + Next.js + TypeScript), cross-platform mobile (Flutter/Dart),
  iOS native (Swift/SwiftUI — authored on Windows, built on macOS CI), optional React Native/Expo,
  and a preserved **legacy "foundations" tier**. All unified by a single design-token source.
- **Key constraints:** Windows-only local builds (no local iOS — SwiftUI is reference code until
  macOS CI); solo maintainer (DX and low-maintenance, managed tooling matter); preserve the
  `jazer-brand` identity and the existing work.
- **Non-goals (first pass):** not rewriting/auto-converting all 2,057 legacy components; not
  shipping store-ready mobile apps; not building the authenticated product backend yet.

---

## 2. Assumptions

- TypeScript everywhere on the JS side.
- **pnpm + Turborepo** monorepo; **Changesets** scaffolded but dormant until npm publish is desired.
- **SCSS/Sass-first** web styling (replaces the originally-considered Tailwind + shadcn).
- Brand values are **lifted verbatim** from `jazer-brand.css` into a structured token source —
  the look does not change, it becomes structured + multi-platform.
- **Vercel** is the web deploy target; **GitHub Actions** for CI (including a macOS runner for iOS).
- Phased delivery: web-first in pass 1; native pillars proven with one thin vertical slice; full
  mobile apps / authed product in later phases.

---

## 3. Non-Functional Requirements (proposed defaults)

| Dimension | Target |
|---|---|
| **Performance** | Performance-conscious; good Lighthouse scores. Tokens/SCSS compiled at build; legacy served as static assets (zero render cost). Not tuned for extreme/high-traffic loads. |
| **Scale** | Portfolio-scale traffic. Architected to scale (stateless web, CDN/static, managed services) but not provisioned for high load in pass 1. |
| **Security / Privacy** | Minimal in pass 1 (static showcase, no user data). Real security work (authn/z, secrets, input validation, RLS) begins at the authenticated-product phase. |
| **Reliability / Availability** | Vercel-grade hosting + preview deploys. Not mission-critical; no uptime SLA. |
| **Maintenance / Ownership** | Solo developer. Favor managed services, strong CI, and DX-first tooling. Write-once token/style propagation minimizes cross-platform maintenance. |

---

## 4. Decision Log

| # | Decision | Alternatives considered | Why |
|---|---|---|---|
| D1 | North-star = **one monorepo** that is the *superset* of all four visions (design system + showcase + product + installable kit) | Pick a single vision | The four are folders, not competing projects; a monorepo design system contains all of them |
| D2 | Core web stack = **React + Next.js + TypeScript** | Vue + Nuxt; Svelte + SvelteKit | Real native mobile code-share (via React ecosystem), dominant hiring market, first-class session tooling (Vercel/Next), preserves brand work |
| D3 | **Polyglot multi-platform pillars**: Web (React/Next) + Flutter/Dart + SwiftUI (+ legacy tier), optional React Native, unified by **shared design tokens** | React-everywhere only | User is actively learning Swift/Xcode + Dart/Flutter and wants to showcase the *different* mobile resources, not one |
| D4 | iOS = **authored on Windows, built on macOS CI** (GitHub Actions macOS runner) | Skip iOS; buy a Mac; cloud Mac (MacinCloud) | Windows-only now; macOS runners verify SwiftUI in CI without owning hardware |
| D5 | Architecture approach **A** — token-spine monorepo, **depth-first architecture / narrow content** (thin vertical slice) | B (web-first, defer mobile); C (full polyglot now, breadth-first) | Nothing built is throwaway *and* the multi-platform thesis is proven on day one, without breadth-first stall |
| D6 | Monorepo tooling = **pnpm + Turborepo + Changesets** (dormant) | npm/yarn workspaces; Nx | pnpm: strict + disk-efficient; Turbo: lightweight + Vercel-native (Nx = over-tooling); Changesets ready for later publish |
| D7 | **Native boundary**: `packages/tokens` commits generated `Theme.swift` / `jazer_theme.dart` into the native folders; native apps never run the Node pipeline | Native runs the token build itself | Decouples three toolchains; each native app is self-sufficient (clone-and-build) |
| D8 | **Tiered token source** (primitive → semantic → theme sets) in W3C Design-Tokens JSON, built by **Style Dictionary** to per-platform outputs; brand values lifted verbatim | Ad-hoc per-platform theming | Proper design-token architecture; re-theme by swapping semantic→primitive maps; one source → all platforms/themes |
| D9 | **SCSS/Sass-first** web design system (replaces Tailwind/shadcn); modern `@use`/`@forward`, 7-1-style layout | Tailwind + shadcn | Plays to the author's CSS/BEM strength; legitimate senior approach (Bootstrap/Foundation-style); unifies the legacy library |
| D10 | **Layered styling consumption**: global BEM bundle (`@jazer/styles` → `jazer.css`) built with **CSS `@layer`** cascade layers (ITCSS ordering); **typed React wrappers** apply BEM classes; **CSS Modules** (`*.module.scss`) only for app-local one-offs | Pure CSS Modules everywhere; pure global with no wrappers | Write-once/theme-everywhere (incl. legacy), typed DX, predictable cascade (no specificity wars), clean design-system ↔ application boundary |
| D11 | Component catalog = **Storybook 8 + Vite builder** | Ladle | Industry standard; deep a11y/interaction/visual-regression (Chromatic) + MDX docs matching existing axe/Playwright rigor; CSF keeps it portable to Ladle later |
| D12 | **Legacy** = `git mv` into `legacy/`, served statically from `apps/web/public/legacy/`, re-skinned by dropping in `jazer.css`, indexed into Hub search; not rewritten in pass 1 | Auto-convert; delete | Preserves history + a year of work, unifies the look for free, and the bracketed-dir glob problem disappears (static files, not glob targets) |
| D13 | **Next.js App Router** with route groups `(hub)` / `(showcase)` / `(docs)`; search via a **typed component registry**; favorites in `localStorage` for pass 1 | Scrape HTML for search (current approach) | Structured, reliable search index with metadata (platform/category/tags); preserves the `/`-hotkey UX |
| D14 | **CI/CD** = GitHub Actions: web (turbo lint/build/test → Vercel preview), token-drift check, flutter analyze/test, iOS `xcodebuild` on macOS runner, dormant Changesets publish | Single web-only pipeline | Each pillar verified independently; macOS runner resolves the Windows/iOS constraint |

---

## 5. Final Architecture

### 5.1 Monorepo skeleton

```
jazer/
├─ package.json            # root: pnpm workspaces + turbo tasks
├─ pnpm-workspace.yaml
├─ turbo.json              # pipeline: build → lint → test (cached)
├─ packages/
│  ├─ tokens/              # design-token SOURCE + Style Dictionary build
│  ├─ styles/              # @jazer/styles — the SCSS/Sass design system
│  ├─ ui/                  # React component library (typed wrappers; publishable)
│  └─ config/              # shared tsconfig / eslint / prettier
├─ apps/
│  └─ web/                 # Next.js showcase / Hub / docs → Vercel
├─ native/                 # OUTSIDE the JS workspace (different toolchains)
│  ├─ flutter/             # Flutter app; consumes generated jazer_theme.dart
│  └─ ios-swiftui/         # Xcode project; consumes generated Theme.swift
└─ legacy/                 # today's [HTML]/[CSS]/[JS], moved verbatim (history preserved)
```

- **Tooling:** pnpm (strict, disk-efficient), Turborepo (cached task orchestration, Vercel-native),
  Changesets (dormant until npm publish).
- **Polyglot boundary:** `native/*` are not pnpm/Turbo workspaces. `packages/tokens` **commits** its
  generated `Theme.swift` / `jazer_theme.dart` into the native folders — the build artifact is the
  contract, so native builds never need Node.

### 5.2 Token pipeline (the architectural heart)

```
packages/tokens/src/*.json           # SINGLE source of truth (W3C Design Tokens)
  primitives   raw palette (jazer-cyan #00f0ff, pink, purple), spacing, radii, fonts, shadows
  semantic     meaning not value (color.bg, color.surface, color.accent, color.danger …)
  theme sets   light / dark map the SAME semantic names to different primitives

        │  Style Dictionary
        ▼
  ┌── web/     _tokens.scss (Sass vars + maps)  +  CSS custom properties
  ├── ios/     Theme.swift (Color/Font extensions)
  └── flutter/ jazer_theme.dart (ThemeData + JazerColors)
```

- Components reference **semantic** tokens (`color.accent`), never raw hex — re-theme by swapping
  the semantic→primitive mapping; nothing downstream changes.
- Each output is **committed into its consumer** (`packages/styles` abstracts, `native/ios-swiftui`,
  `native/flutter`).
- Brand fidelity: existing `jazer-brand` values are lifted verbatim. The look is unchanged; it
  becomes structured and multi-platform. The current `data-theme` light/dark system is preserved on
  web; native gets light+dark variants from the same theme sets.

### 5.3 Web styling — layered SCSS/Sass design system

```
packages/styles/src/
├─ abstracts/  _tokens.scss (generated), _maps.scss, _functions.scss, _mixins.scss
│              # fluid-type(), responsive(), spacing(), z(), color helpers
├─ base/       _reset.scss, _root.scss (CSS custom props), _typography.scss
├─ components/ _button.scss, _card.scss, _modal.scss …  (BEM blocks: btn, btn--primary)
├─ layout/     _grid.scss, _container.scss
├─ themes/     _light.scss, _dark.scss   (semantic maps → data-theme)
├─ utilities/  _helpers.scss
└─ main.scss   @use's everything → compiles to one jazer.css bundle
```

- Modern Sass module system (`@use` / `@forward`, not deprecated `@import`).
- **CSS cascade layers** enforce ITCSS ordering in the cascade itself:
  `@layer reset, base, layout, components, utilities;` — a utility always beats a component beats
  base, regardless of source order or specificity. Global CSS becomes predictable and safe.
- The "complex/senior" craft lives in **abstracts**: Sass maps for palette/spacing/z-index, functions
  that read them, mixins for responsive/fluid/theming.

**Consumption model (the discipline):**

| You're styling… | Use |
|---|---|
| A reusable component (button, card, modal) | Global BEM in `@jazer/styles` |
| A typed React API over that component | Wrapper in `packages/ui` |
| A one-off layout only this page needs | `*.module.scss` in `apps/web` |

- Global bundle = the portable design artifact (themes React + legacy + any HTML).
- `packages/ui` React wrappers are ~thin typed components mapping props → BEM classes
  (`<Button variant="primary">` → `className="btn btn--primary"`) — full TypeScript DX, zero
  re-implemented styles.
- CSS Modules reserved for genuinely app-local styling (scoped, never pollutes the system).

### 5.4 `packages/ui` + Storybook + the Next.js Hub + legacy

- **`packages/ui`** — typed React wrappers (`<Button>`, `<Card>`, `<Input>`, `<Modal>` …).
  Accessibility ported from the existing JS components (e.g. `modal-dialog.js`'s focus-trap,
  `Escape`, return-focus, scroll-lock). Tree-shakeable exports for later npm publish.
- **Storybook 8 (Vite builder)** = the design system's home/docs: interactive catalog, controls,
  dark/light, a11y addon (axe per component), interaction tests, MDX docs, Chromatic-ready visual
  regression. Stories are CSF → portable to Ladle if ever needed.
- **`apps/web`** (Next.js App Router) — the new Hub replacing root `index.html`:

```
/ (hub)            landing — global search ("/" hotkey) + favorites (localStorage)
/web               live React component showcase (render + code + copy)
/foundations       the ~2,057 legacy components, browsable + searchable
/mobile/flutter    Flutter pillar (embeds/screens + code)
/mobile/ios        SwiftUI pillar (code + CI-built screenshots)
/docs              tokens + usage docs
```

- **Legacy integration:** `legacy/` is served from `apps/web/public/legacy/` (static, zero build
  cost) — every standalone file still opens as today, re-skinned by `jazer.css`, indexed into Hub
  search. The bracketed-folder glob gotcha disappears (static files, not glob targets).
- **Search:** generated from a **typed component registry** (replaces HTML scraping), with platform/
  category/tag metadata. `/`-hotkey palette UX preserved.

### 5.5 Native pillars, CI/CD & testing

- **`native/flutter/`** — Flutter showcase app (builds on Windows). Imports generated
  `jazer_theme.dart`. Pass-1 slice: the themed **Button**.
- **`native/ios-swiftui/`** — Xcode/SwiftUI project, authored on Windows (no local build), imports
  generated `Theme.swift`. Pass-1 slice: a SwiftUI **Button** view. Built/verified on macOS CI.

**CI/CD (GitHub Actions):**

```
web        pnpm → turbo lint+build+test (Playwright/axe) → Vercel preview per PR
tokens     rebuild tokens; FAIL if generated output drifts from committed (the contract)
flutter    flutter analyze + flutter test            (ubuntu runner)
ios        xcodebuild on a macOS RUNNER               (verifies SwiftUI without owning a Mac)
changesets (dormant) publish packages/ui + tokens to npm when enabled
```

**Testing:** web → Playwright + axe (carried over) + Storybook interaction/Vitest; tokens → drift
check; flutter → widget tests; iOS → XCTest in CI.

---

## 6. First-Pass Build Sequence (depth-first spine → thin slice)

```
0. Repo prep   git mv [HTML]/[CSS]/[JS] → legacy/; init pnpm+turbo; packages/config
1. Tokens      jazer-brand values → packages/tokens JSON (primitive→semantic→theme);
               Style Dictionary → _tokens.scss + css vars + Theme.swift + jazer_theme.dart
2. Styles      @jazer/styles SCSS (@layer abstracts/base/components/themes) → jazer.css;
               author the `btn` block first
3. UI          packages/ui typed <Button> wrapper + Storybook + a11y story
4. Web         apps/web Next.js Hub; render <Button>; /foundations serves+links legacy;
               search/favorites; deploy to Vercel
5. Native      Flutter Button from jazer_theme.dart; SwiftUI Button from Theme.swift
6. CI/CD       web + token-drift + flutter + iOS(macOS runner) workflows
```

Steps 1→5 are **one vertical slice through every pillar**. After that, "add a component" = repeat
steps 2→5 for the next component.

---

## 7. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Front-loaded complexity (token pipeline + Turbo wiring is the hard 20%) | It's the *first* thing built (steps 0–1); everything after is repetition |
| iOS only CI-verified, not interactively iterated (no local Mac) | Author small, lean on macOS-runner builds + snapshot tests; revisit if a Mac becomes available |
| Scope creep / breadth-first stall | Discipline: thin vertical slice in pass 1; resist populating all platforms before the spine is proven |
| Global CSS naming/specificity drift | BEM discipline + CSS `@layer` ordering; lint with stylelint |
| Solo maintenance across many pillars | Write-once token/style propagation; managed services; strong CI gates |

---

## 8. Future Phases (out of scope for pass 1)

- **Phase 2 — Breadth:** repeat steps 2→5 per component; begin curating/porting select legacy
  components into first-class design-system components.
- **Phase 3 — Product:** full-stack authenticated app (Next.js server + Postgres (Neon) +
  Drizzle/Prisma + auth via Clerk/Auth.js). Security NFRs activate here.
- **Phase 4 — Distribution & mobile:** flip Changesets on to publish `@jazer/ui` + `@jazer/tokens`;
  add React Native/Expo if desired; build mobile apps toward store-ready.

---

## 9. Open Questions (to resolve during implementation)

- Exact set of pass-1 web components beyond Button (Card, Input, Modal — confirm the 4–6).
- Whether React Native/Expo enters in Phase 4 or is dropped (Flutter may cover mobile sufficiently).
- Search/favorites: stay `localStorage` or graduate to a backend when the product phase begins.
