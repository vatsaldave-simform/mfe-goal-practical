## Context

`@mfe/api` is an empty scaffold package (`export {}`) that already has `@mfe/shared` as a workspace dependency and compiles with `tsc`. The project's conventions mandate that all network calls flow through this package (CONVENTIONS.md), and ADR-006 defines its responsibilities: axios client with cookie auth, TanStack Query provider, and query key factories. The shared types (`Product`, `CartResponse`, `OrderDetail`, `SafeUser`, `ApiError`), constants (`API_BASE_URL`, `ROUTES`), and schemas (`ProductFilterInput`) are already implemented in `@mfe/shared`.

This package is consumed as a build-time dependency via `workspace:*` AND as a runtime singleton via Module Federation shared config (ADR-005).

## Goals / Non-Goals

**Goals:**

- Provide a configured axios instance that handles auth cookies and 401 errors
- Provide a QueryClient with project-wide cache defaults
- Provide query key factories for all four API domains (products, cart, orders, auth)
- Export everything from a single barrel so MFEs import from `@mfe/api`

**Non-Goals:**

- Query hooks (`useProducts`, `useCart`, etc.) — follow-up change
- Mutation functions and invalidation logic — follow-up change
- Error boundary or toast integration — MFE-level concern
- Retry/offline tuning beyond sensible defaults

## Decisions

### D1: Single axios instance in `src/client.ts`

**Choice:** One pre-configured axios instance exported as `apiClient`.

**Rationale:** ADR-006 mandates a single shared instance with `withCredentials: true`. A single instance ensures all requests carry cookies and pass through the 401 interceptor consistently.

**Alternatives considered:**
- Thin `fetch` wrapper — rejected because axios provides interceptors, automatic JSON transforms, and better error shapes out of the box.
- Per-domain clients — rejected; unnecessary complexity when all domains share the same backend at `API_BASE_URL`.

**Configuration:**

```
apiClient = axios.create({
  baseURL: API_BASE_URL,        ← from @mfe/shared/constants
  withCredentials: true,         ← ADR-003: httpOnly cookie auth
  headers: { "Content-Type": "application/json" }
})
```

**401 interceptor:** On 401 response, redirect to `/login` via `window.location.href` (not react-router) to force a full page reload and clear stale state. This avoids coupling the API package to react-router (per ADR-003).

```
                                ┌─────────────┐
   MFE Component               │  @mfe/api   │
  ──────────────────────►       │  apiClient  │ ──────► Backend :3003
   import { apiClient }         │             │ ◄──────
                                │  401? ──────┼──► window.location = "/login"
                                └─────────────┘
```

### D2: QueryClient + Provider in `src/provider.tsx`

**Choice:** Export both a `queryClient` singleton and an `ApiProvider` React component that wraps `QueryClientProvider`.

**Rationale:** The host app needs to wrap the entire tree in a single `QueryClientProvider` (ADR-005 singleton). Exporting the `queryClient` instance directly also allows prefetching outside React (per `pf-ensure-query-data`).

**Cache defaults** (per `cache-defaults`, `cache-stale-time`):

| Setting | Value | Rationale |
|---------|-------|-----------|
| `staleTime` | `60 * 1000` (60s) | CONVENTIONS.md: "60s for reference data" — sensible global default |
| `gcTime` | `5 * 60 * 1000` (5m) | Keep inactive queries in cache for 5 minutes |
| `retry` | `1` | One retry; error boundaries handle persistent failures |
| `refetchOnWindowFocus` | `true` | Default; ensures fresh data when user returns |

Per-query overrides will happen at the hook level in the follow-up change (e.g., user-specific data with `staleTime: 0`).

**Alternatives considered:**
- Export only `queryClient` (no wrapper component) — rejected; a wrapper component is more ergonomic for the host's `App.tsx` and allows adding `ReactQueryDevtools` in one place.
- Let each MFE create its own QueryClient — rejected; violates ADR-005 singleton requirement.

```
  apps/host/src/App.tsx
  ┌─────────────────────────────────────┐
  │ <ApiProvider>                       │  ← from @mfe/api
  │   <BrowserRouter>                   │
  │     <StoreProvider>                 │  ← from @mfe/store
  │       <Routes>                      │
  │         <Route ... storefront />    │
  │         <Route ... account />       │
  │       </Routes>                     │
  │     </StoreProvider>                │
  │   </BrowserRouter>                  │
  │ </ApiProvider>                      │
  └─────────────────────────────────────┘
```

### D3: Query key factories in `src/keys.ts`

**Choice:** A single `src/keys.ts` file exporting four factory objects: `productKeys`, `cartKeys`, `orderKeys`, `authKeys`.

**Rationale:** Per `qk-factory-pattern` and `qk-hierarchical-organization`, factory objects provide type-safe, hierarchical key construction that supports targeted cache invalidation (e.g., `queryClient.invalidateQueries({ queryKey: productKeys.all })`).

**Key structure** (per `qk-array-structure`, `qk-include-dependencies`):

```typescript
export const productKeys = {
  all:    ["products"] as const,
  lists:  ()          => [...productKeys.all, "list"] as const,
  list:   (filters: ProductFilterInput) =>
                        [...productKeys.lists(), filters] as const,
  details:()          => [...productKeys.all, "detail"] as const,
  detail: (id: string)=> [...productKeys.details(), id] as const,
};

export const cartKeys = {
  all:    ["cart"] as const,
  detail: () => [...cartKeys.all, "detail"] as const,
};

export const orderKeys = {
  all:    ["orders"] as const,
  lists:  ()          => [...orderKeys.all, "list"] as const,
  list:   ()          => [...orderKeys.lists()] as const,
  details:()          => [...orderKeys.all, "detail"] as const,
  detail: (id: string)=> [...orderKeys.details(), id] as const,
};

export const authKeys = {
  all:    ["auth"] as const,
  me:     () => [...authKeys.all, "me"] as const,
};
```

**Why one file, not per-domain files:** At the key-factory level there is no business logic — just array construction. A single file keeps all keys discoverable and avoids import indirection. When query hooks are added in the follow-up change, those will live in per-domain files under `src/queries/`.

**Alternatives considered:**
- String-based keys (`"products"`) — rejected; arrays enable partial matching for invalidation (per `qk-array-structure`).
- Per-domain key files — rejected for this scope (no hooks yet); will reconsider if the file grows beyond ~60 lines.

### D4: Package dependencies

**New dependencies in `packages/api/package.json`:**

| Dependency | Type | Rationale |
|---|---|---|
| `axios` | `dependencies` | HTTP client (ADR-006) |
| `@tanstack/react-query` | `dependencies` | QueryClient, QueryClientProvider |
| `react` | `peerDependencies` | Required by react-query; provided by host app |
| `react-dom` | `peerDependencies` | Required by react-query; provided by host app |

`@mfe/shared` is already a dependency. No changes to `@mfe/tsconfig`.

### D5: File layout and barrel exports

```
packages/api/src/
├── client.ts        ← axios instance + interceptors
├── keys.ts          ← query key factories
├── provider.tsx     ← QueryClient + ApiProvider component
└── index.ts         ← barrel: re-exports from client, keys, provider
```

The barrel (`index.ts`) re-exports everything so consumers use `import { apiClient, productKeys, ApiProvider } from "@mfe/api"`.

**Note:** `tsconfig.json` already extends `@mfe/tsconfig/react.json`, which supports JSX — required for the `.tsx` provider file.

## Risks / Trade-offs

**[Risk] 401 interceptor uses `window.location.href` instead of react-router navigation**
→ **Mitigation:** Intentional trade-off. Using `window.location` avoids coupling `@mfe/api` to react-router and guarantees a clean state reset on auth failure. The full page reload is acceptable since 401s should be rare in normal usage by the time this is triggered the session is invalid anyway.

**[Risk] QueryClient staleTime default (60s) may not suit all queries**
→ **Mitigation:** This is a sensible default per CONVENTIONS.md. Individual hooks will override with `staleTime: 0` for user-specific data (cart, auth/me) in the follow-up change.

**[Risk] Package compiles with `tsc` but includes `.tsx` file**
→ **Mitigation:** The tsconfig already extends `react.json` which includes `jsx: "react-jsx"`. The `.tsx` file will compile correctly to `.js` with the JSX runtime import.

**[Risk] `@mfe/api` is both a build-time package and MF runtime singleton**
→ **Mitigation:** Already planned in ADR-005. The MF shared config will mark `@mfe/api` as `singleton: true, requiredVersion` to ensure one instance. No MF config changes needed in this change.
