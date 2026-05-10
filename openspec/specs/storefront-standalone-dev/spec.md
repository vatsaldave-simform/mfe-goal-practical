## ADDED Requirements

### Requirement: Standalone dev mode with providers

When running in standalone mode (via `pnpm dev` in `apps/storefront`), the storefront SHALL wrap `<App>` with `QueryClientProvider` and `BrowserRouter` so the full application works independently on port 3001.

#### Scenario: Storefront runs standalone at port 3001
- **WHEN** developer runs `pnpm dev` in `apps/storefront`
- **THEN** the app SHALL start on port 3001 with `BrowserRouter` and `QueryClientProvider` wrapping the App component, and all routes SHALL be navigable

#### Scenario: Providers not duplicated when consumed via MF
- **WHEN** the host loads storefront via Module Federation
- **THEN** the exposed `./App` component SHALL NOT include its own `BrowserRouter` or `QueryClientProvider` (those come from the host)

### Requirement: Bootstrap async entry pattern

The storefront SHALL use `index.tsx` → dynamic `import('./bootstrap')` pattern for Module Federation async initialization.

#### Scenario: index.tsx is the webpack entry
- **WHEN** Rsbuild processes the storefront entry
- **THEN** `index.tsx` SHALL contain only a dynamic import of `bootstrap.tsx`

#### Scenario: bootstrap.tsx renders the app
- **WHEN** `bootstrap.tsx` executes
- **THEN** it SHALL render the standalone wrapper (with providers) into the DOM root element

### Requirement: Standalone wrapper includes navigation

The standalone dev wrapper SHALL include basic navigation links to all storefront routes for development convenience.

#### Scenario: Dev navigation visible in standalone
- **WHEN** storefront is running in standalone mode
- **THEN** a navigation bar or link set SHALL be visible with links to: Products (index), Cart (/cart), and Checkout (/checkout)

### Requirement: App component is a pure route fragment

The exported `App` component SHALL contain only `<Routes>` with relative route definitions — no providers, no layout chrome, no `BrowserRouter`.

#### Scenario: App renders routes only
- **WHEN** `App` is rendered inside any parent (host or standalone wrapper)
- **THEN** it SHALL render a `<Routes>` block with route definitions and nothing else at the top level
