## Context

`@mfe/api` currently ships three foundational pieces:

- `apiClient` — pre-configured axios instance with 401 interceptor (per `api-client` spec)
- Key factories — `productKeys`, `cartKeys`, `orderKeys`, `authKeys` (per `api-query-keys` spec)
- `ApiProvider` + singleton `queryClient` (per `api-query-provider` spec)

MFE apps have no shared query/mutation hooks yet. Without them each app would duplicate fetch logic, key wiring, and cache invalidation — violating ADR-006 ("All MFEs import from @mfe/api — no direct axios usage in MFE code").

The backend exposes four route groups that map 1-to-1 to the four hook modules:

```
Backend routes             Hook module
──────────────             ───────────
GET  /api/products         ┐
GET  /api/products/:id     ┘  queries/products.ts

GET  /api/cart             ┐
POST /api/cart/items       │
PATCH /api/cart/items/:id  │  queries/cart.ts
DELETE /api/cart/items/:id ┘

GET  /api/orders           ┐
GET  /api/orders/:id       │  queries/orders.ts
POST /api/orders           ┘

POST /auth/register        ┐
POST /auth/login           │
POST /auth/logout          │  queries/auth.ts
GET  /auth/me              ┘
```

## Goals / Non-Goals

**Goals:**

- Provide a complete set of typed TanStack Query hooks covering every backend endpoint.
- Wire all hooks to existing key factories so cache invalidation is hierarchical and predictable (per `qk-factory-pattern`).
- Centralise mutation `onSuccess` invalidation so MFE consumers never need to manage cache manually.
- Keep hooks thin — no business logic, just fetch + invalidate.

**Non-Goals:**

- Optimistic updates (deferred to a later polish change).
- Infinite/cursor-based queries.
- Prefetching strategies (`pf-intent-prefetch`, `pf-route-prefetch` — added when UI pages are built).
- Zustand store sync (auth/cart slices updated separately — per ADR-002 separation).
- `queryOptions` factory wrappers — hooks are sufficient for now; `queryOptions` can be extracted later if needed for prefetching or loader integration.

## Decisions

### D1: One hook file per domain, co-located in `packages/api/src/queries/`

Each backend domain gets its own file: `products.ts`, `cart.ts`, `orders.ts`, `auth.ts`, plus a barrel `index.ts`.

**Rationale:** Mirrors the key factory organisation in `keys.ts` and the backend route structure. Keeps each file small (<100 lines) and independently tree-shakeable.

**Alternative considered:** A single `hooks.ts` file — rejected because it would grow to 300+ lines and conflate unrelated domains.

### D2: Hooks consume `apiClient` directly (not raw axios)

All `queryFn` / `mutationFn` implementations call `apiClient.get(...)`, `apiClient.post(...)` etc.

**Rationale:** Per ADR-006, all HTTP goes through the shared axios instance so the 401 interceptor, `withCredentials`, and base URL apply universally.

### D3: Use existing key factories from `keys.ts` (per `qk-factory-pattern`)

Hooks import `productKeys`, `cartKeys`, etc. and pass them directly as `queryKey`.

```
useProducts(filters) → queryKey: productKeys.list(filters)
useProduct(id)       → queryKey: productKeys.detail(id)
useCart()            → queryKey: cartKeys.detail()
useOrders()          → queryKey: orderKeys.list()
useOrder(id)         → queryKey: orderKeys.detail(id)
useMe()              → queryKey: authKeys.me()
```

**Rationale:** The factories already exist and follow the hierarchical pattern. Reusing them keeps a single source of truth for cache keys (per `qk-include-dependencies`, `qk-hierarchical-organization`).

### D4: Mutation invalidation strategy (per `mut-invalidate-queries`, `cache-invalidation`)

Each mutation invalidates at the broadest necessary scope using the factory root key:

| Mutation | Invalidates | Why |
|---|---|---|
| `useAddToCart` | `cartKeys.all` | Adding an item changes the cart detail, total, and item count |
| `useUpdateCartItem` | `cartKeys.all` | Quantity change affects totals |
| `useRemoveCartItem` | `cartKeys.all` | Removal changes list + totals |
| `useCreateOrder` | `orderKeys.all`, `cartKeys.all` | New order appears in list; cart is emptied by backend |
| `useLogin` | `authKeys.all` | New user session, need fresh `/me` |
| `useRegister` | `authKeys.all` | Same as login |
| `useLogout` | Calls `queryClient.clear()` | All cached data is user-scoped; must purge on logout |

**Rationale:** Cart has only one query (`cartKeys.detail()`), so invalidating `cartKeys.all` is equivalent to targeted invalidation with no waste. For orders, `orderKeys.all` covers both list and detail. Logout clears the entire cache because all server data is user-specific — stale data from a previous session must never leak.

### D5: Type imports from `@mfe/shared` and Zod schemas

Hooks use types already defined in `@mfe/shared`:

- Query return types: `Product`, `ProductListResponse`, `CartResponse`, `OrderSummary`, `OrderDetail`, `SafeUser`, `AuthResponse`
- Mutation input types: `LoginInput`, `RegisterInput`, `AddToCartInput`, `UpdateCartItemInput` (Zod-inferred from `@mfe/shared` schemas, per ADR-008)

No new types needed in `@mfe/api`. This maintains `@mfe/shared` as the single source of truth for domain types (per `typescript-advanced-types` — avoid duplicating types across packages).

### D6: Hook option forwarding

Each query hook accepts an optional `options` parameter (partial `UseQueryOptions`) so consumers can override `enabled`, `staleTime`, `select`, etc. per use-site without needing a separate hook.

```ts
useProducts(filters, { enabled: !!filters.category })
useMe({ staleTime: Infinity })  // auth rarely changes during a session
```

**Rationale:** Per `perf-select-transform` and `cache-stale-time`, consumers may need per-site overrides. Forwarding options avoids an explosion of one-off wrapper hooks.

**Type constraint:** Options are typed as `Omit<UseQueryOptions<TData, ...>, 'queryKey' | 'queryFn'>` to prevent consumers from accidentally overriding the key or fetch function.

### D7: Barrel re-export through `packages/api/src/index.ts`

`index.ts` adds `export * from "./queries"` alongside existing exports. Consumers import everything from `@mfe/api`:

```ts
import { useProducts, useCart, useLogin, apiClient, productKeys } from "@mfe/api";
```

**Rationale:** Single entry point per ADR-006. Barrel is acceptable here because `@mfe/api` is a shared singleton (MF shared config) so tree-shaking is less critical — all hooks ship together.

## Data Flow

```
┌──────────────┐     import     ┌──────────────────────┐
│  storefront  │ ─────────────► │  @mfe/api             │
│  account     │                │                        │
└──────┬───────┘                │  queries/products.ts   │
       │ useProducts(filters)   │  queries/cart.ts       │
       │                        │  queries/orders.ts     │
       ▼                        │  queries/auth.ts       │
┌──────────────┐                │         │              │
│  TanStack    │◄───────────────│  useQuery / useMutation│
│  QueryClient │  queryKey from │         │              │
│  (singleton) │  keys.ts       │         ▼              │
└──────┬───────┘                │  apiClient.get/post    │
       │ cache                  │  (from client.ts)      │
       │ invalidation           └──────────┬─────────────┘
       ▼                                   │
┌──────────────┐                           │ HTTP
│  React       │                           ▼
│  components  │                    ┌─────────────┐
│  re-render   │                    │  Express     │
└──────────────┘                    │  backend     │
                                    │  :3003       │
                                    └─────────────┘
```

## File Structure

```
packages/api/src/
├── client.ts              ← existing (unchanged)
├── keys.ts                ← existing (unchanged)
├── provider.tsx           ← existing (unchanged)
├── index.ts               ← add: export * from "./queries"
└── queries/
    ├── index.ts           ← barrel: re-exports all 4 modules
    ├── products.ts        ← useProducts, useProduct
    ├── cart.ts            ← useCart, useAddToCart, useUpdateCartItem, useRemoveCartItem
    ├── orders.ts          ← useOrders, useOrder, useCreateOrder
    └── auth.ts            ← useMe, useLogin, useRegister, useLogout
```

## Risks / Trade-offs

- **[Risk] Over-invalidation on cart mutations** → Mitigated: cart has a single query key (`cartKeys.detail()`) so invalidating `cartKeys.all` triggers exactly one refetch. If cart queries expand later, revisit with targeted invalidation.
- **[Risk] `queryClient.clear()` on logout is aggressive** → Mitigated: all cached data is user-specific in this app. If shared/public data (e.g., product catalog) should persist across logout, switch to selective invalidation of user-scoped keys only. For now, clear is correct.
- **[Risk] No optimistic updates means brief loading states on cart mutations** → Accepted: per proposal non-goals, optimistic updates are deferred. The UX is acceptable for a learning project and avoids rollback complexity.
- **[Trade-off] Barrel re-export in index.ts** → All hooks are bundled together. Acceptable because `@mfe/api` is a Module Federation singleton shared across all MFEs — there's no per-app tree-shaking boundary.

## Open Questions

_(none — all decisions resolved based on existing ADRs, specs, and skill rules)_
