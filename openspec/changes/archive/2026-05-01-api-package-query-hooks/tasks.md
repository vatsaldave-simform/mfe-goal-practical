## 1. Product Query Hooks

> **Target:** `packages/api/src/queries/products.ts`
> **Skills to load:** tanstack-query-best-practices, typescript-advanced-types

- [x] 1.1 Create `packages/api/src/queries/products.ts` with `useProducts` hook — accepts optional `ProductFilterInput` filters and query option overrides, uses `productKeys.list(filters)` as query key, calls `apiClient.get(ROUTES.PRODUCTS.LIST, { params: filters })`, returns `UseQueryResult<ProductListResponse>`
- [x] 1.2 Add `useProduct` hook to the same file — accepts `id: string` and query option overrides, uses `productKeys.detail(id)` as query key, calls `apiClient.get(ROUTES.PRODUCTS.DETAIL(id))`, returns `UseQueryResult<Product>`

## 2. Cart Query & Mutation Hooks

> **Target:** `packages/api/src/queries/cart.ts`
> **Skills to load:** tanstack-query-best-practices, typescript-advanced-types

- [x] 2.1 Create `packages/api/src/queries/cart.ts` with `useCart` hook — accepts query option overrides, uses `cartKeys.detail()` as query key, calls `apiClient.get(ROUTES.CART.GET)`, returns `UseQueryResult<CartResponse>`
- [x] 2.2 Add `useAddToCart` mutation hook — accepts `AddToCartInput`, calls `apiClient.post(ROUTES.CART.ITEMS, data)`, invalidates `cartKeys.all` on success
- [x] 2.3 Add `useUpdateCartItem` mutation hook — accepts `{ id: string; quantity: number }`, calls `apiClient.patch(ROUTES.CART.ITEM(id), { quantity })`, invalidates `cartKeys.all` on success
- [x] 2.4 Add `useRemoveCartItem` mutation hook — accepts `string` (item ID), calls `apiClient.delete(ROUTES.CART.ITEM(id))`, invalidates `cartKeys.all` on success

## 3. Order Query & Mutation Hooks

> **Target:** `packages/api/src/queries/orders.ts`
> **Skills to load:** tanstack-query-best-practices, typescript-advanced-types

- [x] 3.1 Create `packages/api/src/queries/orders.ts` with `useOrders` hook — accepts query option overrides, uses `orderKeys.list()` as query key, calls `apiClient.get(ROUTES.ORDERS.LIST)`, returns `UseQueryResult` with `{ orders: OrderSummary[] }`
- [x] 3.2 Add `useOrder` hook — accepts `id: string` and query option overrides, uses `orderKeys.detail(id)` as query key, calls `apiClient.get(ROUTES.ORDERS.DETAIL(id))`, returns `UseQueryResult<OrderDetail>`
- [x] 3.3 Add `useCreateOrder` mutation hook — accepts no input, calls `apiClient.post(ROUTES.ORDERS.CREATE)`, invalidates both `orderKeys.all` and `cartKeys.all` on success

## 4. Auth Query & Mutation Hooks

> **Target:** `packages/api/src/queries/auth.ts`
> **Skills to load:** tanstack-query-best-practices, typescript-advanced-types

- [x] 4.1 Create `packages/api/src/queries/auth.ts` with `useMe` hook — accepts query option overrides (notably `enabled`), uses `authKeys.me()` as query key, calls `apiClient.get(ROUTES.AUTH.ME)`, returns `UseQueryResult<AuthResponse>`
- [x] 4.2 Add `useLogin` mutation hook — accepts `LoginInput`, calls `apiClient.post(ROUTES.AUTH.LOGIN, data)`, invalidates `authKeys.all` on success, returns `AuthResponse`
- [x] 4.3 Add `useRegister` mutation hook — accepts `RegisterInput`, calls `apiClient.post(ROUTES.AUTH.REGISTER, data)`, invalidates `authKeys.all` on success, returns `AuthResponse`
- [x] 4.4 Add `useLogout` mutation hook — accepts no input, calls `apiClient.post(ROUTES.AUTH.LOGOUT)`, calls `queryClient.clear()` on success to purge all user-scoped cache

## 5. Barrel Exports & Wiring

> **Target:** `packages/api/src/queries/index.ts`, `packages/api/src/index.ts`
> **Skills to load:** turborepo

- [x] 5.1 Create `packages/api/src/queries/index.ts` — barrel file re-exporting `./products`, `./cart`, `./orders`, `./auth`
- [x] 5.2 Update `packages/api/src/index.ts` — add `export * from "./queries"` alongside existing exports

## 6. Build Verification

> **Target:** `packages/api`
> **Skills to load:** turborepo

- [x] 6.1 Run `pnpm --filter @mfe/api build` and verify TypeScript compiles with zero errors
