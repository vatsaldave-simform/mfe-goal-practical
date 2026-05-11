## Context

The MFE e-commerce app currently runs on `localhost` with hardcoded URLs:

```
apps/host    :3000 ─── consumes ──→ storefront@http://localhost:3001/mf-manifest.json
                                     account@http://localhost:3002/mf-manifest.json
                   ─── API calls ──→ http://localhost:3003/api/*
```

Auth uses httpOnly cookies (`sameSite: "lax"`). Without a custom domain, each platform subdomain (e.g. `*.vercel.app`, `*.onrender.com`) is isolated — browsers won't send cookies set by one subdomain to another. This is the central constraint driving the proxy design.

**Stack**: Rsbuild (bundler), Module Federation v2 (runtime integration), Express + Prisma + SQLite (backend), Turborepo + pnpm (monorepo).

## Goals / Non-Goals

**Goals:**
- Deploy all 4 services (host, storefront, account, backend) to free-tier platforms
- Each MFE frontend deploys independently as a separate project
- httpOnly cookie auth continues working without a custom domain
- Local development remains unchanged (`localhost` defaults)
- Zero new npm dependencies

**Non-Goals:**
- Custom domain configuration
- CI/CD pipeline or GitHub Actions
- Database provider migration (stays SQLite)
- SSR/edge rendering
- Auth strategy changes (stays httpOnly cookies)

## Decisions

### D1: Vercel for frontend hosting, Render for backend

**Choice**: Three separate Vercel projects (host, storefront, account) + one Render web service (backend).

**Alternatives considered**:
- *Cloudflare Pages*: Unlimited bandwidth but `_redirects`-based proxy is less flexible than Vercel rewrites for cookie proxying. Vercel has better monorepo DX.
- *Render for everything*: Could host static sites on Render too, but Render static sites lack rewrite/proxy capabilities needed for the API proxy pattern.
- *Railway*: Free trial is time-limited ($5 credit); Render free tier is ongoing with persistent disk.

**Rationale**: Vercel's `rewrites` in `vercel.json` provide server-side proxying — the browser never sees the backend origin. Render provides persistent disk for SQLite at no cost. Both platforms auto-deploy on git push.

### D2: API proxy through host via Vercel rewrites

**Choice**: Host's `vercel.json` includes a rewrite rule: `/api/:path*` → `https://<render-backend>/api/:path*`.

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser (mfe-host.vercel.app)                                   │
│                                                                   │
│  POST /api/auth/login                                            │
│       │                                                          │
│       ▼ (same-origin request, cookie flows naturally)            │
│  Vercel Edge Network                                              │
│       │                                                          │
│       ▼ (server-side rewrite — browser never sees backend URL)   │
│  mfe-backend.onrender.com/api/auth/login                         │
│       │                                                          │
│       ▼ (Set-Cookie: token=xxx; HttpOnly; SameSite=Lax)          │
│  Cookie stored on: mfe-host.vercel.app  ✓                        │
│                                                                   │
│  Subsequent requests:                                            │
│  GET /api/products  → Cookie: token=xxx sent automatically  ✓    │
└─────────────────────────────────────────────────────────────────┘
```

**Why not just set `sameSite: "none"` + `secure: true`?**: This would require the browser to send cookies cross-origin, which triggers 3rd-party cookie restrictions in Safari and will fail in Chrome when 3rd-party cookies are fully deprecated. The proxy approach is future-proof.

**Alternatives considered**:
- *Switch to Bearer token auth*: Would eliminate the cross-origin issue entirely, but reduces security (tokens accessible to JS, XSS risk) and requires auth architecture changes.
- *Cloudflare Worker proxy*: Works but adds another platform and vendor to manage.

### D3: Environment variable strategy — build-time injection via Rsbuild

**Choice**: Two categories of env vars:

| Variable | Used in | Scope | Mechanism |
|----------|---------|-------|-----------|
| `STOREFRONT_URL` | `module-federation.config.ts` (host) | Build-time Node.js | Rsbuild CLI loads `.env` into `process.env`; config files read it directly |
| `ACCOUNT_URL` | `module-federation.config.ts` (host) | Build-time Node.js | Same as above |
| `PUBLIC_API_URL` | `packages/shared/src/constants.ts` | Client-side code | Rsbuild replaces `process.env.PUBLIC_API_URL` via `source.define` at bundle time |

Per Rsbuild docs, `.env` files are loaded by the CLI into Node.js `process.env`. Variables prefixed with `PUBLIC_` are additionally injected into client source code via `source.define`. Since `@mfe/shared` is a workspace package built by tsc first, then bundled by Rsbuild, the `process.env.PUBLIC_API_URL` reference in the compiled JS survives tsc and is replaced by Rsbuild during final bundling.

```
packages/shared/src/constants.ts
  │ tsc compiles to:
  ▼
packages/shared/dist/src/constants.js
  export const API_BASE_URL = process.env.PUBLIC_API_URL || "http://localhost:3003";
  │ Rsbuild bundles, source.define replaces process.env.PUBLIC_API_URL:
  ▼
Final bundle (production): API_BASE_URL = "" || "http://localhost:3003"  →  ""
Final bundle (dev):        API_BASE_URL = undefined || "http://localhost:3003"  →  "http://localhost:3003"
```

For production, `PUBLIC_API_URL=""` (empty string) makes API calls use relative paths (`/api/products`), which the Vercel proxy handles. For local dev, the env var is unset, so the fallback `http://localhost:3003` is used.

**Alternatives considered**:
- *`source.define` in each `rsbuild.config.ts`*: More explicit but duplicates config across 3 apps. Using `.env` + `PUBLIC_` prefix is the idiomatic Rsbuild approach.
- *Runtime configuration (window.__CONFIG__)*: More flexible but adds complexity and an extra network request at startup.

### D4: MF remote URLs — env vars in module-federation.config.ts (host only)

**Choice**: Only the host's `module-federation.config.ts` needs to change. Remote apps (storefront, account) don't reference other remotes.

```typescript
// apps/host/module-federation.config.ts
const STOREFRONT_URL = process.env.STOREFRONT_URL || "http://localhost:3001";
const ACCOUNT_URL = process.env.ACCOUNT_URL || "http://localhost:3002";

remotes: {
  storefront: `storefront@${STOREFRONT_URL}/mf-manifest.json`,
  account: `account@${ACCOUNT_URL}/mf-manifest.json`,
}
```

Since `module-federation.config.ts` is imported at build-time in Node.js context (via `rsbuild.config.ts`), regular `process.env` works — no `PUBLIC_` prefix needed.

### D5: CORS headers on remote MFE static assets

**Choice**: Add `Access-Control-Allow-Origin: *` headers to all assets served by storefront and account Vercel projects.

Module Federation loads `mf-manifest.json` via `fetch()` (cross-origin from host's domain). Without CORS headers, the browser blocks the manifest request. JS chunk loading uses `<script>` tags (no CORS needed) but the manifest is fetched via XHR/fetch.

```jsonc
// apps/storefront/vercel.json  &  apps/account/vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET" }
      ]
    }
  ]
}
```

Using `*` is safe here — these are public static assets (JS bundles, manifests). No credentials are sent to remote MFE origins.

### D6: Vercel build configuration for monorepo

**Choice**: Each Vercel project sets its **Root Directory** to the app folder and uses Turborepo's `--filter` flag for builds.

Per the turborepo skill, always use `turbo run build` (not shorthand). The `--filter` flag builds only the target app and its workspace dependencies:

```
Build Command:  cd ../.. && pnpm install && turbo run build --filter=@mfe/host
Output Dir:     dist
Root Directory: apps/host
```

Vercel detects the monorepo and handles `pnpm install` at the repo root. The root directory setting tells Vercel where the deployable output (`dist/`) lives.

### D7: Render backend configuration

**Choice**: Deploy as a Node.js web service with persistent disk for SQLite.

```
┌─── Render Web Service ──────────────────────────────────────┐
│                                                              │
│  Build:  pnpm install                                        │
│          && turbo run build --filter=@mfe/backend             │
│          && cd apps/backend && npx prisma migrate deploy      │
│                                                              │
│  Start:  node apps/backend/dist/src/index.js                 │
│                                                              │
│  Disk:   /data (1GB free) → DATABASE_URL=file:/data/dev.db   │
│                                                              │
│  Env:    PORT=3003                                            │
│          NODE_ENV=production                                  │
│          JWT_SECRET=<generated>                               │
│          DATABASE_URL=file:/data/dev.db                       │
│          ALLOWED_ORIGINS=https://mfe-host.vercel.app          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

Key: `prisma migrate deploy` (not `prisma migrate dev`) applies pending migrations without interactivity. The seed runs only on first deploy (or explicitly via `prisma db seed`).

### D8: Cookie security hardening for production (per ADR-003)

**Choice**: Add `secure: true` conditionally based on `NODE_ENV`:

```typescript
res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

Per ADR-003, the JWT token is never stored in Zustand or client-accessible state. The `secure` flag ensures cookies are only sent over HTTPS in production (Vercel proxy uses HTTPS).

### D9: Backend CORS tightening

**Choice**: Replace open `origin: true` with environment-driven allowlist:

```typescript
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : undefined;

app.use(cors({
  origin: allowedOrigins || true,
  credentials: true,
}));
```

In production, `ALLOWED_ORIGINS=https://mfe-host.vercel.app` restricts which origins can make credentialed requests. In local dev, falls back to `origin: true` (allow all).

## Deployment Topology

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRODUCTION TOPOLOGY                              │
│                                                                         │
│  ┌─── Vercel Project: mfe-host ──────────────────────────────┐         │
│  │  URL: mfe-host.vercel.app                                  │         │
│  │                                                            │         │
│  │  /              → static dist/ (host SPA)                  │         │
│  │  /api/:path*    → PROXY → mfe-backend.onrender.com/api/*   │         │
│  │                                                            │         │
│  │  Env: STOREFRONT_URL, ACCOUNT_URL, PUBLIC_API_URL=""       │         │
│  └────────────────────────────────────────────────────────────┘         │
│         │                                                               │
│         │ loads mf-manifest.json (cross-origin, CORS: *)                │
│         ▼                                                               │
│  ┌─── Vercel: mfe-storefront ──┐  ┌─── Vercel: mfe-account ──┐        │
│  │  mfe-storefront.vercel.app   │  │  mfe-account.vercel.app   │        │
│  │  Static: dist/ + CORS *      │  │  Static: dist/ + CORS *   │        │
│  └──────────────────────────────┘  └───────────────────────────┘        │
│                                                                         │
│  ┌─── Render: mfe-backend ──────────────────────────────────┐          │
│  │  mfe-backend.onrender.com                                 │          │
│  │  Express + Prisma + SQLite on /data                       │          │
│  │  Free tier: sleeps after 15 min idle                      │          │
│  └───────────────────────────────────────────────────────────┘          │
└────────────────────────────────────────────────────────────────────────┘
```

## File Change Map

| File | Change | Owner |
|------|--------|-------|
| `packages/shared/src/constants.ts` | `API_BASE_URL` → env-var-driven | `@mfe/shared` |
| `apps/host/module-federation.config.ts` | Remote URLs → env-var-driven | `@mfe/host` |
| `apps/backend/src/routes/auth.ts` | Add `secure` flag to cookies | `@mfe/backend` |
| `apps/backend/src/index.ts` | CORS → env-driven allowlist | `@mfe/backend` |
| `apps/host/vercel.json` | **NEW** — API proxy rewrite + SPA fallback | `@mfe/host` |
| `apps/storefront/vercel.json` | **NEW** — CORS headers | `@mfe/storefront` |
| `apps/account/vercel.json` | **NEW** — CORS headers | `@mfe/account` |

## Risks / Trade-offs

| Risk | Severity | Mitigation |
|------|----------|------------|
| Render free-tier cold start (~30s after 15 min idle) | Medium | Acceptable for demo. Document for users. |
| Vercel rewrite adds ~50ms latency to every API call | Low | Negligible for demo. Direct backend calls in future with custom domain. |
| SQLite on Render persistent disk — no replication, no backups | Low | Sufficient for learning project. Migration path: Turso (libSQL, SQLite-compatible). |
| Vercel free tier: 100 GB bandwidth/month | Low | More than enough for a demo project. |
| `mf-manifest.json` caching — stale manifests after remote redeploy | Medium | Vercel sets reasonable cache headers. Users may need hard-refresh after remote deploys. Can add cache-bust query param later. |
| Three Vercel projects watching one repo — every push triggers 3 builds | Low | Vercel's turborepo integration can detect unchanged apps and skip. Ignore patterns in `vercel.json` can further limit. |

## Open Questions

- **Render seed strategy**: Should the first deploy auto-seed product data, or should seeding be a manual step? Current plan: manual `prisma db seed` after first deploy via Render shell.
- **SPA fallback routing**: The host needs all routes to fall back to `index.html` for client-side routing. Need to verify Vercel handles this automatically for static deployments, or if explicit rewrite is needed.
