## ADDED Requirements

### Requirement: Each frontend app has a separate module-federation.config.ts
Each frontend app (host, storefront, account) SHALL have its own `module-federation.config.ts` file that is separate from `rsbuild.config.ts`, defining the Module Federation name and shared dependency configuration.

#### Scenario: MF config file exists for each frontend app
- **WHEN** inspecting the `apps/host/`, `apps/storefront/`, and `apps/account/` directories
- **THEN** each contains a `module-federation.config.ts` file alongside its `rsbuild.config.ts`

#### Scenario: MF config is imported by Rsbuild config
- **WHEN** inspecting each frontend app's `rsbuild.config.ts`
- **THEN** it imports the MF configuration from `./module-federation.config.ts` and passes it to `pluginModuleFederation()`

### Requirement: Each frontend app declares a unique MF name
Each frontend app's `module-federation.config.ts` SHALL declare a unique `name` property matching the app's identity.

#### Scenario: MF names match app identities
- **WHEN** inspecting the `name` field in each app's `module-federation.config.ts`
- **THEN** host declares `name: "host"`, storefront declares `name: "storefront"`, and account declares `name: "account"`

### Requirement: React is a shared singleton across all frontend apps
All three frontend apps SHALL declare `react` as a shared singleton in their Module Federation configuration with `requiredVersion: "^19.0.0"`.

#### Scenario: React singleton prevents duplicate instances
- **WHEN** inspecting the `shared` configuration in each frontend app's `module-federation.config.ts`
- **THEN** `react` is declared with `{ singleton: true, requiredVersion: "^19.0.0" }`

### Requirement: React DOM is a shared singleton across all frontend apps
All three frontend apps SHALL declare `react-dom` as a shared singleton in their Module Federation configuration with `requiredVersion: "^19.0.0"`.

#### Scenario: React DOM singleton ensures single DOM reconciler
- **WHEN** inspecting the `shared` configuration in each frontend app's `module-federation.config.ts`
- **THEN** `react-dom` is declared with `{ singleton: true, requiredVersion: "^19.0.0" }`

### Requirement: React Router is a shared singleton across all frontend apps
All three frontend apps SHALL declare `react-router` as a shared singleton in their Module Federation configuration with `requiredVersion: "^7.0.0"`.

#### Scenario: React Router singleton ensures single router context
- **WHEN** inspecting the `shared` configuration in each frontend app's `module-federation.config.ts`
- **THEN** `react-router` is declared with `{ singleton: true, requiredVersion: "^7.0.0" }`

### Requirement: Zustand is a shared singleton across all frontend apps
All three frontend apps SHALL declare `zustand` as a shared singleton in their Module Federation configuration with `requiredVersion: "^5.0.0"`.

#### Scenario: Zustand singleton ensures single store instance
- **WHEN** inspecting the `shared` configuration in each frontend app's `module-federation.config.ts`
- **THEN** `zustand` is declared with `{ singleton: true, requiredVersion: "^5.0.0" }`

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

### Requirement: MF plugin is registered in Rsbuild configuration
Each frontend app's `rsbuild.config.ts` SHALL register the `pluginModuleFederation` plugin from `@module-federation/rsbuild-plugin`.

#### Scenario: Rsbuild config includes MF plugin
- **WHEN** inspecting each frontend app's `rsbuild.config.ts`
- **THEN** it imports `pluginModuleFederation` from `@module-federation/rsbuild-plugin` and includes it in the `plugins` array with the app's MF configuration
