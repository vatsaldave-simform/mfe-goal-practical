## ADDED Requirements

### Requirement: Pages use shared API query hooks

All storefront pages SHALL use the existing query hooks from `@mfe/api` (`useProducts`, `useProduct`, `useCart`, `useAddToCart`, `useUpdateCartItem`, `useRemoveCartItem`, `useCreateOrder`) — no direct axios usage in MFE code.

#### Scenario: Product list uses useProducts
- **WHEN** `ProductListPage` mounts
- **THEN** it SHALL call `useProducts(filters)` from `@mfe/api` with current search params as filter arguments

#### Scenario: Product detail uses useProduct
- **WHEN** `ProductDetailPage` mounts with route param `:id`
- **THEN** it SHALL call `useProduct(id)` from `@mfe/api`

#### Scenario: Cart page uses useCart
- **WHEN** `CartPage` or `CheckoutPage` mounts
- **THEN** it SHALL call `useCart()` from `@mfe/api`

### Requirement: Loading states rendered during data fetch

All pages SHALL display loading UI while queries are in their initial loading state (`isLoading === true`).

#### Scenario: Skeleton shown during product list load
- **WHEN** `useProducts` has `isLoading: true`
- **THEN** `ProductListPage` SHALL render a skeleton grid (placeholder cards)

#### Scenario: Skeleton shown during product detail load
- **WHEN** `useProduct` has `isLoading: true`
- **THEN** `ProductDetailPage` SHALL render a skeleton layout

#### Scenario: Skeleton shown during cart load
- **WHEN** `useCart` has `isLoading: true`
- **THEN** `CartPage` SHALL render a skeleton/loading indicator

### Requirement: Error states handled gracefully

All pages SHALL display user-friendly error messages when queries fail.

#### Scenario: Network error on product list
- **WHEN** `useProducts` returns `isError: true`
- **THEN** `ProductListPage` SHALL display an error message with a retry option

#### Scenario: Network error on cart
- **WHEN** `useCart` returns `isError: true`
- **THEN** `CartPage` SHALL display an error message with a retry option

### Requirement: Products have appropriate staleTime

Product queries SHALL use a `staleTime` of 60 seconds since the product catalog changes infrequently.

#### Scenario: Product data cached for 60s
- **WHEN** `useProducts` or `useProduct` is called
- **THEN** it SHALL pass `staleTime: 60_000` (or use a configured default) so that navigating back to the product list does not trigger an unnecessary refetch within 60 seconds

### Requirement: Cart mutations invalidate cart queries

All cart mutations (`useAddToCart`, `useUpdateCartItem`, `useRemoveCartItem`) SHALL trigger cache invalidation of cart queries on success (already handled in `@mfe/api`, but pages MUST NOT override this behavior).

#### Scenario: Cart refreshes after add
- **WHEN** `useAddToCart` mutation succeeds
- **THEN** `cartKeys.all` queries SHALL be invalidated (handled by `@mfe/api`), causing any mounted `useCart` to refetch

#### Scenario: Cart refreshes after remove
- **WHEN** `useRemoveCartItem` mutation succeeds
- **THEN** `cartKeys.all` queries SHALL be invalidated, refreshing the cart page display
