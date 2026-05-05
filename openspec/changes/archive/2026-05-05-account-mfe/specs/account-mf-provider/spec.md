## ADDED Requirements

### Requirement: Account MF config exposes ./App
The `apps/account/module-federation.config.ts` SHALL declare `exposes: { "./App": "./src/App.tsx" }` so the host can load the account remote component.

#### Scenario: Host can import account/App
- **WHEN** the host app imports `account/App` via Module Federation
- **THEN** the import SHALL resolve to the default export of `apps/account/src/App.tsx`

#### Scenario: Expose key uses ./ prefix
- **WHEN** inspecting the account MF config's `exposes` field
- **THEN** the key SHALL be `"./App"` (with `./` prefix per MF convention)

### Requirement: Account MF config shares @mfe/store and @mfe/api as singletons
The `apps/account/module-federation.config.ts` SHALL include `@mfe/store` and `@mfe/api` in the `shared` configuration as singletons with `requiredVersion: "workspace:*"`, matching the host's shared config.

#### Scenario: @mfe/store is shared as singleton
- **WHEN** inspecting the account MF config's `shared` field
- **THEN** `@mfe/store` SHALL be declared with `{ singleton: true, requiredVersion: "workspace:*" }`

#### Scenario: @mfe/api is shared as singleton
- **WHEN** inspecting the account MF config's `shared` field
- **THEN** `@mfe/api` SHALL be declared with `{ singleton: true, requiredVersion: "workspace:*" }`

#### Scenario: Shared config matches host's declarations
- **WHEN** comparing the account and host MF shared configs
- **THEN** both SHALL declare the same set of singletons (react, react-dom, react-router, zustand, @mfe/store, @mfe/api) with matching version constraints

### Requirement: Account App.tsx exports a route-ready component with relative Routes
The `apps/account/src/App.tsx` SHALL default-export a component that renders `<Routes>` from `react-router` with relative path `<Route>` entries for login, register, and profile.

#### Scenario: App renders internal routes
- **WHEN** the `App` component is rendered inside a router context
- **THEN** it SHALL render `<Routes>` containing:
  - `<Route path="login" element={<LoginPage />} />`
  - `<Route path="register" element={<RegisterPage />} />`
  - `<Route path="profile" element={<ProfilePage />} />`

#### Scenario: Routes are relative (no leading slash)
- **WHEN** inspecting the `<Route>` path props in `App.tsx`
- **THEN** all paths SHALL be relative (e.g., `"login"` not `"/login"` or `"/account/login"`)

#### Scenario: App does not render its own BrowserRouter
- **WHEN** inspecting `App.tsx`
- **THEN** it SHALL NOT import or render `<BrowserRouter>`, `<HashRouter>`, or any router provider
- **AND** routing context SHALL be provided by the host (MF mode) or by `bootstrap.tsx` (standalone mode)

### Requirement: Standalone bootstrap wraps App in BrowserRouter and ApiProvider
The `apps/account/src/bootstrap.tsx` SHALL wrap `<App />` in `<BrowserRouter>` from `react-router` and `<ApiProvider>` from `@mfe/api` for standalone development mode.

#### Scenario: Standalone mode provides router context
- **WHEN** running the account app standalone via `pnpm dev` in `apps/account/`
- **THEN** `bootstrap.tsx` SHALL render `<BrowserRouter>` wrapping `<App />`
- **AND** navigation between `/login`, `/register`, and `/profile` SHALL work

#### Scenario: Standalone mode provides QueryClientProvider
- **WHEN** running the account app standalone
- **THEN** `bootstrap.tsx` SHALL render `<ApiProvider>` (from `@mfe/api`) wrapping `<App />`
- **AND** TanStack Query hooks (useLogin, useRegister, useMe) SHALL function correctly

#### Scenario: Bootstrap renders with a base path for account routes
- **WHEN** running standalone
- **THEN** `bootstrap.tsx` SHALL set the BrowserRouter `basename` to `"/account"` so routes resolve at `/account/login`, `/account/register`, `/account/profile`

### Requirement: Account app adds react-hook-form and @hookform/resolvers as dependencies
The `apps/account/package.json` SHALL declare `react-hook-form` and `@hookform/resolvers` in its `dependencies` field.

#### Scenario: react-hook-form is a runtime dependency
- **WHEN** inspecting `apps/account/package.json`
- **THEN** `"react-hook-form"` SHALL appear in `dependencies`

#### Scenario: @hookform/resolvers is a runtime dependency
- **WHEN** inspecting `apps/account/package.json`
- **THEN** `"@hookform/resolvers"` SHALL appear in `dependencies`

### Requirement: Account app index.tsx uses async import for MF bootstrap
The `apps/account/src/index.tsx` SHALL use a dynamic `import("./bootstrap")` to ensure Module Federation async startup works correctly.

#### Scenario: Entry point uses dynamic import
- **WHEN** inspecting `apps/account/src/index.tsx`
- **THEN** it SHALL contain `import("./bootstrap")` as the only statement
- **AND** it SHALL NOT have synchronous imports of React or application code
