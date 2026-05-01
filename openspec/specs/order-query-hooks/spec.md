## ADDED Requirements

### Requirement: @mfe/api exports a useOrders query hook
The `@mfe/api` package SHALL export a `useOrders` hook from `src/queries/orders.ts` that fetches the authenticated user's order list.

#### Scenario: useOrders fetches the order list
- **WHEN** a component calls `useOrders()`
- **THEN** the hook SHALL call `apiClient.get(ROUTES.ORDERS.LIST)`
- **AND** the hook SHALL use `orderKeys.list()` as the query key
- **AND** the hook SHALL return a `UseQueryResult` typed to the orders list response containing an array of `OrderSummary`

#### Scenario: useOrders accepts option overrides
- **WHEN** a component calls `useOrders({ enabled: isAuthenticated })`
- **THEN** the hook SHALL forward the `enabled` option to `useQuery`
- **AND** the hook SHALL NOT allow overriding `queryKey` or `queryFn`

### Requirement: @mfe/api exports a useOrder query hook
The `@mfe/api` package SHALL export a `useOrder` hook from `src/queries/orders.ts` that fetches a single order by ID.

#### Scenario: useOrder fetches an order by ID
- **WHEN** a component calls `useOrder("order-abc")`
- **THEN** the hook SHALL call `apiClient.get(ROUTES.ORDERS.DETAIL("order-abc"))`
- **AND** the hook SHALL use `orderKeys.detail("order-abc")` as the query key
- **AND** the hook SHALL return a `UseQueryResult<OrderDetail>`

#### Scenario: useOrder accepts option overrides
- **WHEN** a component calls `useOrder(id, { staleTime: 60_000 })`
- **THEN** the hook SHALL forward the `staleTime` option to `useQuery`
- **AND** the hook SHALL NOT allow overriding `queryKey` or `queryFn`

### Requirement: @mfe/api exports a useCreateOrder mutation hook
The `@mfe/api` package SHALL export a `useCreateOrder` hook from `src/queries/orders.ts` that creates an order from the current cart.

#### Scenario: useCreateOrder posts to the orders endpoint
- **WHEN** a component calls `mutate()`
- **THEN** the hook SHALL call `apiClient.post(ROUTES.ORDERS.CREATE)`

#### Scenario: useCreateOrder invalidates order and cart queries on success
- **WHEN** the create-order mutation succeeds
- **THEN** the hook SHALL invalidate queries matching `orderKeys.all` so the order list refetches
- **AND** the hook SHALL invalidate queries matching `cartKeys.all` because the backend empties the cart after order creation

#### Scenario: useCreateOrder accepts no input
- **WHEN** the mutation function is called
- **THEN** it SHALL accept no arguments (the backend uses the authenticated user's current cart)

### Requirement: Order hooks use apiClient for all HTTP requests
All order hooks SHALL use the shared `apiClient` instance from `@mfe/api/client` for HTTP requests.

#### Scenario: Query hooks use apiClient
- **WHEN** `useOrders` or `useOrder` executes its query function
- **THEN** it SHALL call `apiClient.get()` rather than importing axios directly

#### Scenario: Mutation hooks use apiClient
- **WHEN** `useCreateOrder` executes its mutation function
- **THEN** it SHALL call `apiClient.post()` rather than importing axios directly

### Requirement: Order hooks use route constants from @mfe/shared
All order hooks SHALL use `ROUTES.ORDERS.*` constants from `@mfe/shared` for endpoint URLs.

#### Scenario: useOrders uses ROUTES.ORDERS.LIST
- **WHEN** `useOrders` builds its request URL
- **THEN** it SHALL use `ROUTES.ORDERS.LIST` (value: `"/api/orders"`)

#### Scenario: useOrder uses ROUTES.ORDERS.DETAIL
- **WHEN** `useOrder` builds its request URL for order ID `"order-abc"`
- **THEN** it SHALL use `ROUTES.ORDERS.DETAIL("order-abc")` (value: `"/api/orders/order-abc"`)

#### Scenario: useCreateOrder uses ROUTES.ORDERS.CREATE
- **WHEN** `useCreateOrder` builds its request URL
- **THEN** it SHALL use `ROUTES.ORDERS.CREATE` (value: `"/api/orders"`)

### Requirement: Order hooks are re-exported from @mfe/api
The `useOrders`, `useOrder`, and `useCreateOrder` hooks SHALL be importable from the `@mfe/api` package entry point.

#### Scenario: Hooks are accessible from the package entry point
- **WHEN** a consumer writes `import { useOrders, useOrder, useCreateOrder } from "@mfe/api"`
- **THEN** the import SHALL resolve successfully because `src/queries/orders.ts` is re-exported through `src/queries/index.ts` and `src/index.ts`
