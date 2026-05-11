## ADDED Requirements

### Requirement: API_BASE_URL is driven by PUBLIC_API_URL environment variable
The `packages/shared/src/constants.ts` module SHALL read `process.env.PUBLIC_API_URL` at the point of declaration and fall back to `"http://localhost:3003"` when the variable is not defined.

#### Scenario: Production build with PUBLIC_API_URL set to empty string
- **WHEN** the Rsbuild build runs with `PUBLIC_API_URL=""` in the environment
- **THEN** `API_BASE_URL` resolves to `""` (empty string), causing API calls to use relative paths on the same origin

#### Scenario: Local development without PUBLIC_API_URL defined
- **WHEN** the Rsbuild dev server runs without `PUBLIC_API_URL` in the environment or `.env` files
- **THEN** `API_BASE_URL` resolves to `"http://localhost:3003"` (the fallback value)

#### Scenario: Custom PUBLIC_API_URL value
- **WHEN** the environment sets `PUBLIC_API_URL=https://staging-api.example.com`
- **THEN** `API_BASE_URL` resolves to `"https://staging-api.example.com"`

### Requirement: MF remote URLs in host are driven by environment variables
The `apps/host/module-federation.config.ts` SHALL read `process.env.STOREFRONT_URL` and `process.env.ACCOUNT_URL` at build time and fall back to `"http://localhost:3001"` and `"http://localhost:3002"` respectively.

#### Scenario: Production build on Vercel with remote URLs set
- **WHEN** Vercel builds the host with `STOREFRONT_URL=https://mfe-storefront.vercel.app` and `ACCOUNT_URL=https://mfe-account.vercel.app`
- **THEN** the MF remotes configuration resolves to `storefront@https://mfe-storefront.vercel.app/mf-manifest.json` and `account@https://mfe-account.vercel.app/mf-manifest.json`

#### Scenario: Local development without remote URL env vars
- **WHEN** the Rsbuild dev server runs without `STOREFRONT_URL` or `ACCOUNT_URL` set
- **THEN** the MF remotes configuration resolves to `storefront@http://localhost:3001/mf-manifest.json` and `account@http://localhost:3002/mf-manifest.json`
