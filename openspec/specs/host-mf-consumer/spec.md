## ADDED Requirements

### Requirement: Host declares storefront as a Module Federation remote
The host app's `module-federation.config.ts` SHALL declare `storefront` as a remote pointing to the storefront MF manifest URL at `http://localhost:3001/mf-manifest.json`.

#### Scenario: Storefront remote entry is configured
- **WHEN** inspecting `apps/host/module-federation.config.ts`
- **THEN** the `remotes` object contains `storefront: "storefront@http://localhost:3001/mf-manifest.json"`

### Requirement: Host declares account as a Module Federation remote
The host app's `module-federation.config.ts` SHALL declare `account` as a remote pointing to the account MF manifest URL at `http://localhost:3002/mf-manifest.json`.

#### Scenario: Account remote entry is configured
- **WHEN** inspecting `apps/host/module-federation.config.ts`
- **THEN** the `remotes` object contains `account: "account@http://localhost:3002/mf-manifest.json"`

### Requirement: Host shares @mfe/store as a singleton via MF config
The host app's `module-federation.config.ts` SHALL declare `@mfe/store` as a shared singleton dependency so all remotes share the same Zustand store instance at runtime.

#### Scenario: @mfe/store is a shared singleton
- **WHEN** inspecting the `shared` configuration in `apps/host/module-federation.config.ts`
- **THEN** `@mfe/store` is declared with `{ singleton: true, requiredVersion: "workspace:*" }`

### Requirement: Host shares @mfe/api as a singleton via MF config
The host app's `module-federation.config.ts` SHALL declare `@mfe/api` as a shared singleton dependency so all remotes share the same API client and QueryClient instance at runtime.

#### Scenario: @mfe/api is a shared singleton
- **WHEN** inspecting the `shared` configuration in `apps/host/module-federation.config.ts`
- **THEN** `@mfe/api` is declared with `{ singleton: true, requiredVersion: "workspace:*" }`

### Requirement: Host uses loaded-first share strategy
The host app's `module-federation.config.ts` SHALL use `shareStrategy: "loaded-first"` to resolve shared dependencies from whichever version loads first at runtime.

#### Scenario: Share strategy is loaded-first
- **WHEN** inspecting `apps/host/module-federation.config.ts`
- **THEN** the config includes `shareStrategy: "loaded-first"`

### Requirement: Host retains existing shared singletons
The host app's MF config SHALL continue to declare `react`, `react-dom`, `react-router`, and `zustand` as shared singletons alongside the new `@mfe/store` and `@mfe/api` entries.

#### Scenario: All required singletons are present
- **WHEN** inspecting the `shared` configuration in `apps/host/module-federation.config.ts`
- **THEN** the following are all present as singletons: `react` (^19.0.0), `react-dom` (^19.0.0), `react-router` (^7.0.0), `zustand` (^5.0.0), `@mfe/store` (workspace:*), `@mfe/api` (workspace:*)

## MODIFIED Requirements

### Requirement: Host routes correctly partition auth, account, and orders paths

The host must mount each account MFE component under its correct base path with the correct guard.

#### Scenario: /auth/* only serves guest routes

- **WHEN** a user navigates to `/auth/login` or `/auth/register`
- **THEN** the host renders `account/AuthApp` wrapped in `GuestGuard`
- **WHEN** a user navigates to `/auth/profile` or any other non-auth path under `/auth/`
- **THEN** no route matches (404 or no render)

#### Scenario: /account/* serves authenticated profile

- **WHEN** an authenticated user navigates to `/account/profile`
- **THEN** the host renders `account/App` wrapped in `AuthGuard`
- **WHEN** an unauthenticated user navigates to `/account/profile`
- **THEN** `AuthGuard` redirects to `/auth/login`

#### Scenario: /orders/* serves authenticated orders

- **WHEN** an authenticated user navigates to `/orders`
- **THEN** the host renders `account/OrdersApp` wrapped in `AuthGuard`, showing the orders list
- **WHEN** an authenticated user navigates to `/orders/:id`
- **THEN** the host renders `account/OrdersApp` wrapped in `AuthGuard`, showing the order detail
- **WHEN** an unauthenticated user navigates to `/orders` or `/orders/:id`
- **THEN** `AuthGuard` redirects to `/auth/login`

#### Scenario: Skeleton fallbacks are constrained by PageContainer

- **WHEN** any MFE route is loading (Suspense fallback)
- **THEN** the `RemoteSkeleton` renders inside `PageContainer`, with max-width constraint applied
