## ADDED Requirements

### Requirement: Cart mutations sync itemCount to Zustand store

After any cart mutation succeeds, the storefront SHALL update the Zustand store's `itemCount` via `store.setCartCount()` so the host's cart badge reflects the current count.

#### Scenario: Add to cart updates badge count
- **WHEN** `useAddToCart` mutation succeeds and returns a `CartResponse`
- **THEN** the storefront SHALL call `useStore.getState().setCartCount(response.itemCount)` (or equivalent) to sync the badge

#### Scenario: Remove from cart updates badge count
- **WHEN** `useRemoveCartItem` mutation succeeds
- **THEN** the storefront SHALL refetch the cart (via invalidation) and update `setCartCount` with the new `itemCount`

#### Scenario: Update quantity updates badge count
- **WHEN** `useUpdateCartItem` mutation succeeds and returns a `CartResponse`
- **THEN** the storefront SHALL call `setCartCount(response.itemCount)` to keep the badge in sync

#### Scenario: Place order clears badge count
- **WHEN** `useCreateOrder` mutation succeeds (cart is emptied)
- **THEN** the storefront SHALL call `setCartCount(0)` (or use the response's itemCount which will be 0)

### Requirement: Badge sync uses mutation response data

The cart badge sync SHALL use the `itemCount` field from the mutation response (or the refetched cart query) as the source of truth — NOT a local counter increment/decrement.

#### Scenario: Response-based count prevents drift
- **WHEN** any cart mutation returns a `CartResponse` with `itemCount`
- **THEN** that exact value SHALL be passed to `setCartCount`, ensuring the badge matches server state regardless of concurrent modifications
