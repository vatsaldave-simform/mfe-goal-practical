## MODIFIED Requirements

### Requirement: No exposes or remotes configured at foundation stage
At the monorepo foundation stage, no frontend app SHALL declare `exposes` or `remotes` in its Module Federation configuration. These SHALL be added by future changes (host-shell, storefront-mfe, account-mfe).

**Note:** This requirement is now further updated by the account-mfe change. The account app's `exposes` field is populated with `{ "./App": "./src/App.tsx" }`. The storefront app retains empty `exposes` until its respective MFE change.

#### Scenario: Host has remotes configured for storefront and account
- **WHEN** inspecting `apps/host/module-federation.config.ts`
- **THEN** the `remotes` field contains entries for `storefront` and `account` pointing to their respective `mf-manifest.json` URLs

#### Scenario: Account app exposes ./App
- **WHEN** inspecting `apps/account/module-federation.config.ts`
- **THEN** the `exposes` field SHALL contain `{ "./App": "./src/App.tsx" }`

#### Scenario: Storefront app still has no exposes configured
- **WHEN** inspecting `apps/storefront/module-federation.config.ts`
- **THEN** the `exposes` field is either absent or an empty object
