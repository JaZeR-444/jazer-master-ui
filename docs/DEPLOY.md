# Deploying `apps/web` to Vercel

The Hub (`apps/web`) is a standard Next.js App Router app inside a pnpm + Turborepo monorepo.
Vercel has first-class support for this layout.

## Option A — Dashboard (recommended)

1. Push this branch and open <https://vercel.com/new>.
2. Import the repository.
3. Set **Root Directory** to `apps/web`.
   Vercel auto-detects **Next.js** and the **Turborepo**, and will:
   - install from the workspace root with pnpm,
   - build only `@jazer/web` and its dependencies (tokens → styles → ui → web),
   - serve `.next`.
4. No environment variables are required for pass 1.
5. Deploy. Every PR then gets a **preview URL** automatically.

## Option B — CLI

```bash
pnpm dlx vercel        # first run links the project; choose apps/web as the root
pnpm dlx vercel --prod # production deploy
```

## Notes

- `next.config.mjs` pins `outputFileTracingRoot` to the repo root so file-tracing is correct
  from the monorepo.
- The legacy library is mirrored into `apps/web/public/legacy/` by `scripts/sync-legacy.mjs`,
  which runs automatically before `dev` and `build`.
- Local preview: `pnpm --filter @jazer/web dev` → <http://localhost:3000>.
