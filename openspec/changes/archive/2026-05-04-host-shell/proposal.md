## Why

The host app (`apps/host`) is currently a bare Rsbuild + React scaffold with no routing, no layout, and an empty MF `remotes` config. It cannot load the storefront or account MFEs, nor does it provide any navigation or shell chrome. This change transforms the host into a functional shell application — the entry point users actually see — so that MFE remotes can be integrated under a unified layout with proper routing.

## What Changes

- Configure MF `remotes` in `apps/host/module-federation.config.ts` to consume `storefront` (port 3001) and `account` (port 3002) via their manifest URLs
- Add `@mfe/store` and `@mfe/api` to the MF `shared` singletons so all remotes share a single store and API client instance
- Set up `BrowserRouter` in the host entry point (single router instance per ADR-004)
- Define route configuration that lazy-loads storefront and account remotes at route boundaries via `React.lazy` + `Suspense`
- Build a shell layout with a top navbar (logo, nav links, cart badge, account icon) and a main content slot where remote components render
- Add a `Suspense` fallback for loading states when remotes are being fetched

## Non-goals

- Implementing auth guards or protected routes (deferred to a future auth-integration change)
- Building the storefront or account MFE content — they remain as-is; this change only sets up the host to *consume* them
- Adding footer, sidebar, or any secondary layout regions
- Implementing responsive/mobile navigation (hamburger menu) — desktop-first for now
- Wiring up real data from `@mfe/store` for cart item count (placeholder / hardcoded zero until store integration)

## Capabilities

### New Capabilities
- `host-mf-consumer`: Host Module Federation consumer configuration — remotes pointing to storefront and account manifests, shared singletons for `@mfe/store` and `@mfe/api`
- `host-routing`: BrowserRouter setup with route definitions that lazy-load MFE remote components at route boundaries
- `host-shell-layout`: Shell layout component — top navbar with logo, navigation links, cart icon with badge, account icon, and a main content area where remotes mount

### Modified Capabilities
- `mf-wiring`: Adding `remotes` entries (storefront, account) and additional `shared` singletons (`@mfe/store`, `@mfe/api`) to the host MF config — previously required to be empty at foundation stage

## Impact

- **apps/host/**: New and modified files — `module-federation.config.ts` (remotes + shared), `src/App.tsx` (BrowserRouter + routes + layout), new `src/components/` (shell layout, navbar), new `src/routes/` (route config)
- **Dependencies**: `react-router` (already in package.json), `lucide-react` (icons for navbar — needs adding), `@mfe/ui` (Button, Badge, etc. — already declared)
- **Dev workflow**: Host dev server (`localhost:3000`) will attempt to fetch MF manifests from storefront (`:3001`) and account (`:3002`). Developers must run all three apps for full integration; host alone will show fallback/error for missing remotes.
- **Existing specs**: Modifies the `mf-wiring` spec requirement that remotes/exposes are empty at foundation stage — this change fills in the host's `remotes`.

## Skills

- **mf** — Module Federation consumer config, shared singletons, manifest remotes
- **vercel-react-best-practices** — React.lazy, Suspense boundaries, composition
- **shadcn** — UI components (Button, Badge, DropdownMenu) in the navbar
- **tailwind-design-system** — Layout tokens, responsive utilities, semantic colors
- **turborepo** — Ensuring `^build` graph is correct with new dependencies
