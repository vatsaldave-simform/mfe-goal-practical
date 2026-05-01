## ADDED Requirements

### Requirement: @mfe/api exports a useCart query hook
The `@mfe/api` package SHALL export a `useCart` hook from `src/queries/cart.ts` that fetches the authenticated user's cart.

#### Scenario: useCart fetches the current cart
- **WHEN** a component calls `useCart()`
- **THEN** the hook SHALL call `apiClient.get(ROUTES.CART.GET)`
- **AND** the hook SHALL use `cartKeys.detail()` as the query key
- **AND** the hook SHALL return a `UseQueryResult<CartResponse>`

#### Scenario: useCart accepts option overrides
- **WHEN** a component calls `useCart({ enabled: isAuthenticated })`
- **THEN** the hook SHALL forward the `enabled` option to `useQuery`
- **AND** the hook SHALL NOT allow overriding `queryKey` or `queryFn`

### Requirement: @mfe/api exports a useAddToCart mutation hook
The `@mfe/api` package SHALL export a `useAddToCart` hook from `src/queries/cart.ts` that adds an item to the cart.

#### Scenario: useAddToCart posts an item to the cart
- **WHEN** a component calls `mutate({ productId: "abc-123", quantity: 2 })`
- **THEN** the hook SHALL call `apiClient.post(ROUTES.CART.ITEMS, { productId: "abc-123", quantity: 2 })`

#### Scenario: useAddToCart invalidates cart queries on success
- **WHEN** the add-to-cart mutation succeeds
- **THEN** the hook SHALL invalidate queries matching `cartKeys.all` so the cart refetches
- **AND** the hook SHALL NOT invalidate any other query key families

#### Scenario: useAddToCart accepts AddToCartInput
- **WHEN** the mutation function is called
- **THEN** it SHALL accept an `AddToCartInput` object (from `@mfe/shared`) with `productId` (string) and `quantity` (number)

### Requirement: @mfe/api exports a useUpdateCartItem mutation hook
The `@mfe/api` package SHALL export a `useUpdateCartItem` hook from `src/queries/cart.ts` that updates a cart item's quantity.

#### Scenario: useUpdateCartItem patches a cart item
- **WHEN** a component calls `mutate({ id: "item-1", quantity: 5 })`
- **THEN** the hook SHALL call `apiClient.patch(ROUTES.CART.ITEM("item-1"), { quantity: 5 })`

#### Scenario: useUpdateCartItem invalidates cart queries on success
- **WHEN** the update mutation succeeds
- **THEN** the hook SHALL invalidate queries matching `cartKeys.all`

#### Scenario: useUpdateCartItem accepts item ID and UpdateCartItemInput
- **WHEN** the mutation function is called
- **THEN** it SHALL accept an object with `id` (string) and `quantity` (number, from `UpdateCartItemInput`)

### Requirement: @mfe/api exports a useRemoveCartItem mutation hook
The `@mfe/api` package SHALL export a `useRemoveCartItem` hook from `src/queries/cart.ts` that removes an item from the cart.

#### Scenario: useRemoveCartItem deletes a cart item
- **WHEN** a component calls `mutate("item-1")`
- **THEN** the hook SHALL call `apiClient.delete(ROUTES.CART.ITEM("item-1"))`

#### Scenario: useRemoveCartItem invalidates cart queries on success
- **WHEN** the remove mutation succeeds
- **THEN** the hook SHALL invalidate queries matching `cartKeys.all`

#### Scenario: useRemoveCartItem accepts a cart item ID
- **WHEN** the mutation function is called
- **THEN** it SHALL accept a single `string` argument representing the cart item ID

### Requirement: Cart mutation hooks use apiClient for all HTTP requests
All cart mutation hooks SHALL use the shared `apiClient` instance from `@mfe/api/client` for HTTP requests.

#### Scenario: Mutations use apiClient
- **WHEN** any cart mutation hook (`useAddToCart`, `useUpdateCartItem`, `useRemoveCartItem`) executes its mutation function
- **THEN** it SHALL call the appropriate `apiClient` method (`.post()`, `.patch()`, `.delete()`) rather than importing axios directly

### Requirement: Cart hooks use route constants from @mfe/shared
All cart hooks SHALL use `ROUTES.CART.*` constants from `@mfe/shared` for endpoint URLs.

#### Scenario: useCart uses ROUTES.CART.GET
- **WHEN** `useCart` builds its request URL
- **THEN** it SHALL use `ROUTES.CART.GET` (value: `"/api/cart"`)

#### Scenario: Mutation hooks use ROUTES.CART.ITEMS and ROUTES.CART.ITEM
- **WHEN** `useAddToCart` builds its request URL
- **THEN** it SHALL use `ROUTES.CART.ITEMS` (value: `"/api/cart/items"`)
- **AND** `useUpdateCartItem` and `useRemoveCartItem` SHALL use `ROUTES.CART.ITEM(id)` (value: `"/api/cart/items/<id>"`)

### Requirement: Cart hooks are re-exported from @mfe/api
The `useCart`, `useAddToCart`, `useUpdateCartItem`, and `useRemoveCartItem` hooks SHALL be importable from the `@mfe/api` package entry point.

#### Scenario: Hooks are accessible from the package entry point
- **WHEN** a consumer writes `import { useCart, useAddToCart, useUpdateCartItem, useRemoveCartItem } from "@mfe/api"`
- **THEN** the import SHALL resolve successfully because `src/queries/cart.ts` is re-exported through `src/queries/index.ts` and `src/index.ts`
