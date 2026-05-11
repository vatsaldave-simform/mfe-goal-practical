## 1. Environment-Driven Configuration

- [x] 1.1 Update `packages/shared/src/constants.ts` — Change `API_BASE_URL` from hardcoded `"http://localhost:3003"` to `process.env.PUBLIC_API_URL || "http://localhost:3003"`. Rebuild `@mfe/shared` and verify the dist output preserves the `process.env.PUBLIC_API_URL` reference. **Target**: `@mfe/shared`. **Skills to load**: rsbuild-best-practices.

- [x] 1.2 Update `apps/host/module-federation.config.ts` — Read `process.env.STOREFRONT_URL` and `process.env.ACCOUNT_URL` with localhost fallbacks, and use them to construct remote manifest URLs. Verify `turbo run dev` still works with localhost defaults. **Target**: `@mfe/host`. **Skills to load**: mf (config-check).

- [x] 1.3 Verify local dev works — Run `turbo run dev` and confirm all 4 services start, MF remotes load, and API calls work with the fallback URLs. **Target**: all apps.

## 2. Backend Security Hardening

- [x] 2.1 Update `apps/backend/src/routes/auth.ts` — Add `secure: process.env.NODE_ENV === "production"` to the `setTokenCookie` function's cookie options. **Target**: `@mfe/backend`.

- [x] 2.2 Update `apps/backend/src/index.ts` — Replace `cors({ origin: true, credentials: true })` with environment-driven CORS: read `process.env.ALLOWED_ORIGINS` (comma-separated), split into array, fall back to `origin: true` when unset. **Target**: `@mfe/backend`.

- [x] 2.3 Verify backend changes — Run `turbo run dev` and confirm auth (login/register/logout) and API calls still work locally with the origin: true fallback. **Target**: `@mfe/backend`.

## 3. Vercel Configuration Files

- [x] 3.1 Create `apps/host/vercel.json` — Add API proxy rewrite (`/api/:path*` → Render backend URL) and SPA fallback rewrite (all non-API routes → `/index.html`). Use a placeholder backend URL that will be replaced during Vercel project setup. **Target**: `@mfe/host`. **Skills to load**: vercel-microfrontends (reference for rewrite patterns).

- [x] 3.2 Create `apps/storefront/vercel.json` — Add CORS `Access-Control-Allow-Origin: *` and `Access-Control-Allow-Methods: GET` headers on all routes. **Target**: `@mfe/storefront`.

- [x] 3.3 Create `apps/account/vercel.json` — Same CORS headers as storefront. **Target**: `@mfe/account`.

## 4. Production Build Verification

- [x] 4.1 Run production build — Execute `turbo run build` and verify all 3 frontend apps and backend build successfully. Check that `packages/shared/dist/src/constants.js` contains the `process.env.PUBLIC_API_URL` reference (not replaced at tsc time). **Target**: all apps.

- [x] 4.2 Verify host dist output — Inspect `apps/host/dist/mf-manifest.json` to confirm it was generated. Check that the build completes without MF errors. **Target**: `@mfe/host`.

## 5. Platform Deployment (Manual Steps)

- [ ] 5.1 Deploy backend to Render — Create a Render web service from the GitHub repo. Configure: build command (`pnpm install && turbo run build --filter=@mfe/backend && cd apps/backend && npx prisma migrate deploy`), start command (`node apps/backend/dist/src/index.js`), persistent disk at `/data`, env vars (`DATABASE_URL=file:/data/dev.db`, `JWT_SECRET`, `NODE_ENV=production`, `PORT=10000`). Seed the database via Render shell: `cd apps/backend && npx prisma db seed`. **Target**: Render platform.

- [ ] 5.2 Deploy storefront to Vercel — Create Vercel project from GitHub repo, set root directory to `apps/storefront`, build command to `cd ../.. && pnpm install && turbo run build --filter=@mfe/storefront`, output directory to `dist`. No env vars needed. **Target**: Vercel platform.

- [ ] 5.3 Deploy account to Vercel — Same pattern as storefront: root directory `apps/account`, build command `cd ../.. && pnpm install && turbo run build --filter=@mfe/account`, output directory `dist`. No env vars needed. **Target**: Vercel platform.

- [ ] 5.4 Deploy host to Vercel — Create Vercel project, root directory `apps/host`, build command `cd ../.. && pnpm install && turbo run build --filter=@mfe/host`, output directory `dist`. Set env vars: `STOREFRONT_URL=https://<storefront-vercel-url>`, `ACCOUNT_URL=https://<account-vercel-url>`, `PUBLIC_API_URL=""` (empty string for relative paths). Update `apps/host/vercel.json` API rewrite destination with the actual Render backend URL. **Target**: Vercel platform.

- [ ] 5.5 End-to-end verification — Visit the host URL, verify: landing page loads, storefront MFE loads (products page), account MFE loads (login/register), auth flow works (register → login → logout), cart operations work, orders work. **Target**: all deployed services.
