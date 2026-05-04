## MODIFIED Requirements

### Requirement: No exposes or remotes configured at foundation stage
At the monorepo foundation stage, no frontend app SHALL declare `exposes` or `remotes` in its Module Federation configuration. These SHALL be added by future changes (host-shell, storefront-mfe, account-mfe).

**Note:** This requirement is now partially superseded by the host-shell change. The host app's `remotes` field is populated with storefront and account entries. The storefront and account apps retain empty `exposes` until their respective MFE changes.

#### Scenario: Host has remotes configured for storefront and account
- **WHEN** inspecting `apps/host/module-federation.config.ts`
- **THEN** the `remotes` field contains entries for `storefront` and `account` pointing to their respective `mf-manifest.json` URLs

#### Scenario: Provider apps still have no exposes configured
- **WHEN** inspecting `apps/storefront/module-federation.config.ts` and `apps/account/module-federation.config.ts`
- **THEN** the `exposes` field is either absent or an empty object
