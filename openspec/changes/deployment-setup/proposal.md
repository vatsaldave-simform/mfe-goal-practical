## Why

The MFE e-commerce application currently runs only on localhost with hardcoded dev URLs throughout the codebase (`localhost:3000–3003`). There is no deployment story — the app cannot be shared, demonstrated, or validated in a production-like environment. Deploying each MFE independently is a core benefit of microfrontend architecture and needs to be proven out for this learning project.

## What Changes

- **Environment-driven configuration**: Replace all hardcoded `localhost` URLs (MF remote manifest URLs, API base URL) with build-time environment variables so the same codebase works for both local development and production.
- **Vercel static hosting for frontends**: Deploy host, storefront, and account as three independent Vercel projects, each building and deploying from the same monorepo with isolated build filters.
- **Render web service for backend**: Deploy the Express + Prisma + SQLite backend on Render's free tier with a persistent disk volume for the database file.
- **API proxy through host**: Add Vercel rewrites on the host project so `/api/*` requests are proxied server-side to the Render backend — keeping httpOnly cookie auth working on a single origin without a custom domain.
- **CORS headers on remote MFE assets**: Configure Vercel response headers on storefront and account projects so the host can fetch `mf-manifest.json` and JS chunks cross-origin.
- **Production cookie security**: Add `secure: true` to cookie options when `NODE_ENV=production`.
- **Backend CORS tightening**: Replace the open `origin: true` CORS policy with an environment-driven allowlist.

## Non-goals

- **Custom domain setup** — the project will use platform-provided subdomains (`*.vercel.app`, `*.onrender.com`).
- **CI/CD pipeline** — Vercel auto-deploys on push by default; no custom GitHub Actions or scripts.
- **Database migration to Postgres/Turso** — SQLite with Render persistent disk is sufficient.
- **SSR or edge rendering** — all frontends remain client-side rendered (CSR) static builds.
- **Auth system changes** — the httpOnly cookie + JWT approach stays; the API proxy makes it work cross-environment without switching to Bearer tokens.

## Capabilities

### New Capabilities

- `deploy-env-config`: Environment-variable-driven configuration for API base URL and MF remote manifest URLs, with localhost fallbacks for local dev.
- `deploy-vercel-static`: Vercel project configuration (`vercel.json`) for all three frontend apps — rewrites (host), CORS headers (remotes), and build settings.
- `deploy-render-backend`: Render web service configuration for the Express backend — build/start commands, persistent disk for SQLite, and environment variables.
- `deploy-cookie-security`: Production-safe cookie settings (`secure`, `sameSite`) and environment-driven CORS origin allowlist on the backend.

### Modified Capabilities

- `shared-constants`: `API_BASE_URL` changes from a hardcoded localhost string to an environment-variable-driven value with fallback.
- `mf-wiring`: Host's `module-federation.config.ts` remotes change from hardcoded localhost URLs to environment-variable-driven URLs with fallbacks.

## Impact

- **`packages/shared/src/constants.ts`** — `API_BASE_URL` becomes env-driven.
- **`apps/host/module-federation.config.ts`** — Remote URLs become env-driven.
- **`apps/host/rsbuild.config.ts`** — May need `source.define` or `PUBLIC_` env exposure for build-time variable injection.
- **`apps/backend/src/routes/auth.ts`** — Cookie options gain `secure` flag for production.
- **`apps/backend/src/index.ts`** — CORS configuration becomes env-driven.
- **New files**: `apps/host/vercel.json`, `apps/storefront/vercel.json`, `apps/account/vercel.json`.
- **Dependencies**: No new npm dependencies required.
- **Risk**: Render free tier cold-starts (~30s after 15 min idle) — acceptable for a demo/learning project.

## Skills

- **rsbuild-best-practices** — Rsbuild build output, `source.define`, env variable injection.
- **mf** — Module Federation remote URL configuration, manifest loading, deployment considerations.
- **vercel-microfrontends** — Reference for Vercel deployment topology (our approach uses static hosting + rewrites, not the `@vercel/microfrontends` package).
- **turborepo** — Filtered builds (`--filter=@mfe/host`), monorepo workspace deployment from a single repo.
