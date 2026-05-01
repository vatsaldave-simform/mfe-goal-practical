## Why

The `@mfe/api` package is currently an empty scaffold (`export {}`), yet every MFE depends on it as the single point of API configuration (ADR-006) and the sole data-fetching layer (CONVENTIONS.md: "No direct `fetch` or `axios` calls in components or stores"). Before any MFE can fetch products, manage carts, or authenticate users, the foundational API infrastructure — axios client, TanStack Query provider, and query key factories — must exist.

## What Changes

- Add an **axios client** (`src/client.ts`) configured with `withCredentials: true`, `API_BASE_URL` from `@mfe/shared`, and a 401 response interceptor (ADR-003)
- Add a **QueryClient provider** (`src/provider.tsx`) with sensible cache defaults (staleTime, gcTime) so MFE host can wrap the app in a single `QueryClientProvider` (ADR-005 singleton)
- Add **query key factories** (`src/keys.ts`) following the factory pattern (`qk-factory-pattern`) for all four domains: `productKeys`, `cartKeys`, `orderKeys`, `authKeys`
- Update `package.json` to add `axios` and `@tanstack/react-query` as runtime dependencies
- Update `src/index.ts` barrel to re-export client, provider, and key factories

## Non-goals

- **Query hooks** (`useProducts`, `useCart`, `useAuth`, `useOrders`) — deferred to a follow-up change; this change only provides the infrastructure they'll consume
- **Mutation functions** — also deferred; this change covers read-side key factories only
- **Error boundary integration** — will be handled when MFE apps are wired up
- **Retry/offline configuration** — can be tuned later; this change sets reasonable defaults

## Capabilities

### New Capabilities

- `api-client`: Axios instance configuration — base URL, `withCredentials`, 401 interceptor, and typed request/response helpers
- `api-query-provider`: TanStack Query `QueryClient` creation with project-wide cache defaults, and a re-exportable `QueryClientProvider` wrapper
- `api-query-keys`: Query key factory objects for products, cart, orders, and auth domains following hierarchical array-key pattern

### Modified Capabilities

_(none — no existing spec requirements change)_

## Impact

- **`packages/api/`** — primary target; new source files + dependency additions
- **`packages/api/package.json`** — adds `axios`, `@tanstack/react-query`, `react` (peer) as dependencies
- **`@mfe/shared`** — consumed (read-only) for `API_BASE_URL`, `ROUTES`, and shared types; no changes to `@mfe/shared` itself
- **MFE apps** (host, storefront, account) — will gain access to the configured client and provider once they declare `@mfe/api` as a dependency (no changes in this change, but unblocks future MFE work)
- **Module Federation shared config** — `@mfe/api` is already planned as a singleton (ADR-005); no MF config changes needed in this change

## Skills

- **tanstack-query-best-practices** — query key factory pattern (`qk-factory-pattern`), cache defaults (`cache-defaults`, `cache-stale-time`), QueryClient configuration
- **typescript-advanced-types** — type-safe API client, generic response types
- **turborepo** — package dependency declarations, build pipeline awareness
