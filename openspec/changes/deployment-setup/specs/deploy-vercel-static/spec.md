## ADDED Requirements

### Requirement: Host project has vercel.json with API proxy rewrite
The `apps/host/vercel.json` file SHALL contain a rewrite rule that maps `/api/:path*` to the Render backend URL appended with `/api/:path*`.

#### Scenario: API requests are proxied to backend
- **WHEN** a browser on the host domain makes a request to `/api/auth/login`
- **THEN** Vercel's edge network rewrites the request server-side to `https://<render-backend-url>/api/auth/login` without the browser seeing the redirect

#### Scenario: Non-API routes fall back to index.html for SPA routing
- **WHEN** a browser navigates to a client-side route like `/products/123`
- **THEN** Vercel serves `index.html` so React Router handles the route client-side

### Requirement: Host vercel.json includes SPA fallback rewrite
The `apps/host/vercel.json` SHALL include a catch-all rewrite from `/((?!api/).*)` (or equivalent) to `/index.html` so that all non-API routes serve the SPA entry point.

#### Scenario: Deep link to client-side route works
- **WHEN** a user directly navigates to `https://mfe-host.vercel.app/auth/login` in the browser
- **THEN** Vercel serves `index.html` and React Router renders the login page

### Requirement: Storefront project has vercel.json with CORS headers
The `apps/storefront/vercel.json` file SHALL set `Access-Control-Allow-Origin: *` and `Access-Control-Allow-Methods: GET` response headers on all routes.

#### Scenario: Host can fetch mf-manifest.json cross-origin
- **WHEN** the host app on `mfe-host.vercel.app` fetches `https://mfe-storefront.vercel.app/mf-manifest.json`
- **THEN** the response includes `Access-Control-Allow-Origin: *` header and the fetch succeeds

### Requirement: Account project has vercel.json with CORS headers
The `apps/account/vercel.json` file SHALL set `Access-Control-Allow-Origin: *` and `Access-Control-Allow-Methods: GET` response headers on all routes.

#### Scenario: Host can fetch account mf-manifest.json cross-origin
- **WHEN** the host app on `mfe-host.vercel.app` fetches `https://mfe-account.vercel.app/mf-manifest.json`
- **THEN** the response includes `Access-Control-Allow-Origin: *` header and the fetch succeeds

### Requirement: Each Vercel project builds using Turborepo filter
Each frontend app's Vercel project SHALL use `turbo run build --filter=@mfe/<app-name>` as the build command, run from the repository root.

#### Scenario: Host Vercel project build command
- **WHEN** Vercel triggers a build for the host project
- **THEN** the build command executes `cd ../.. && turbo run build --filter=@mfe/host` (or equivalent) and the output directory is `dist`

#### Scenario: Storefront Vercel project build command
- **WHEN** Vercel triggers a build for the storefront project
- **THEN** the build command executes `cd ../.. && turbo run build --filter=@mfe/storefront` and the output directory is `dist`

#### Scenario: Account Vercel project build command
- **WHEN** Vercel triggers a build for the account project
- **THEN** the build command executes `cd ../.. && turbo run build --filter=@mfe/account` and the output directory is `dist`
