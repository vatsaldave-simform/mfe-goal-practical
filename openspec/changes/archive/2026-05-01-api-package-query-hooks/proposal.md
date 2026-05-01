## Why

The `@mfe/api` package currently has the foundational pieces — an axios client, query key factories, and an `ApiProvider` — but no TanStack Query hooks. MFE apps (storefront, account) cannot yet fetch data without writing their own `useQuery`/`useMutation` calls with manual key wiring. Adding shared query hooks to `@mfe/api` eliminates per-app boilerplate, centralises cache invalidation logic, and ensures every consumer follows the patterns from ADR-006 (API Layer Design) and ADR-002 (State Management Strategy — "all API data lives in TanStack Query").

## What Changes

- **Add `packages/api/src/queries/products.ts`** — `useProducts` (paginated list with filters), `useProduct` (single by ID) query hooks.
- **Add `packages/api/src/queries/cart.ts`** — `useCart` query hook, `useAddToCart`, `useUpdateCartItem`, `useRemoveCartItem` mutation hooks with cache invalidation of cart queries.
- **Add `packages/api/src/queries/orders.ts`** — `useOrders` (list), `useOrder` (detail by ID) query hooks, `useCreateOrder` mutation hook that invalidates order and cart queries.
- **Add `packages/api/src/queries/auth.ts`** — `useMe` query hook (current user), `useLogin`, `useRegister`, `useLogout` mutation hooks with auth query invalidation.
- **Add `packages/api/src/queries/index.ts`** — barrel export for all query modules.
- **Update `packages/api/src/index.ts`** — re-export `./queries` so consumers import from `@mfe/api`.
- All hooks consume the existing `apiClient`, key factories (`productKeys`, `cartKeys`, `orderKeys`, `authKeys`), and shared types from `@mfe/shared`.

## Capabilities

### New Capabilities
- `product-query-hooks`: TanStack Query hooks for listing/filtering products and fetching a single product by ID.
- `cart-query-hooks`: TanStack Query hooks for fetching the cart and mutation hooks for add/update/remove cart items with cache invalidation.
- `order-query-hooks`: TanStack Query hooks for listing orders, fetching order detail, and placing a new order (checkout) with cache invalidation.
- `auth-query-hooks`: TanStack Query hooks for fetching the current user (`/auth/me`) and mutation hooks for login, register, and logout.

### Modified Capabilities
_(none — existing specs for `api-client`, `api-query-keys`, and `api-query-provider` are unaffected; this change only adds new files that consume them)_

## Non-goals

- Optimistic updates for cart mutations — deferred to a later polish change.
- Infinite/cursor-based pagination for products or orders.
- Token refresh logic (auth uses httpOnly cookies per ADR-003).
- Prefetching or SSR hydration strategies.
- Zustand store integration (auth slice sync will be handled separately per ADR-002).

## Impact

- **Code**: new `packages/api/src/queries/` directory (4 domain files + barrel).
- **Dependencies**: no new runtime dependencies; hooks use `@tanstack/react-query` and `axios` already in `@mfe/api`'s `dependencies`.
- **Types**: hooks import `Product`, `ProductListResponse`, `CartResponse`, `OrderSummary`, `OrderDetail`, `SafeUser`, `AuthResponse` etc. from `@mfe/shared`.
- **Consumers**: `storefront` and `account` apps will import hooks from `@mfe/api` instead of writing ad-hoc fetch logic.
- **ADRs**: ADR-002 (server state in TanStack Query), ADR-006 (shared API layer with key factories + hooks).

## Skills

- **tanstack-query-best-practices** — query/mutation hook patterns, key factory usage, cache invalidation, `select` transforms.
- **typescript-advanced-types** — generic hook return types, Zod-inferred input types.
- **vercel-react-best-practices** — avoiding fetch waterfalls, correct Suspense boundaries.
- **turborepo** — ensuring `@mfe/api` build pipeline is correct.
