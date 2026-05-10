## ADDED Requirements

### Requirement: Storefront exposes App via Module Federation

The storefront app SHALL expose its `App` component via Module Federation at the `./App` key, making it loadable by the host at runtime from `http://localhost:3001/mf-manifest.json`.

#### Scenario: Host resolves storefront remote
- **WHEN** the host app starts and loads the storefront remote
- **THEN** it SHALL successfully resolve `storefront/App` and render the component

#### Scenario: MF manifest is served at correct URL
- **WHEN** the storefront dev server is running on port 3001
- **THEN** `http://localhost:3001/mf-manifest.json` SHALL be accessible and contain the `./App` expose entry

### Requirement: Shared singletons match host configuration

The storefront `module-federation.config.ts` SHALL declare the same shared singletons as the host: `react`, `react-dom`, `react-router`, `zustand`, `@mfe/store`, `@mfe/api` — all as `singleton: true`.

#### Scenario: No duplicate React instances
- **WHEN** storefront is loaded inside the host shell
- **THEN** there SHALL be exactly one React instance shared between host and storefront (verified by `react` singleton config)

#### Scenario: Shared store is the same instance
- **WHEN** storefront reads from `@mfe/store`
- **THEN** it SHALL access the same Zustand store instance as the host and account MFEs

### Requirement: Async bootstrap entry point

The storefront SHALL use the `index.tsx` → `bootstrap.tsx` async entry pattern to support Module Federation's async initialization.

#### Scenario: Entry point delegates to bootstrap
- **WHEN** the storefront bundle loads
- **THEN** `index.tsx` SHALL dynamically import `bootstrap.tsx` to allow MF shared scope initialization before React renders
