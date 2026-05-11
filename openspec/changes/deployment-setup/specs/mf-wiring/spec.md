## MODIFIED Requirements

### Requirement: Host MF remotes use environment-driven URLs
The host app's `module-federation.config.ts` SHALL read `process.env.STOREFRONT_URL` and `process.env.ACCOUNT_URL` at build time to construct remote manifest URLs, falling back to `"http://localhost:3001"` and `"http://localhost:3002"` respectively.

#### Scenario: Host has remotes configured for storefront and account
- **WHEN** inspecting `apps/host/module-federation.config.ts`
- **THEN** the `remotes` field contains entries for `storefront` and `account` pointing to their respective `mf-manifest.json` URLs constructed from environment variables with localhost fallbacks
