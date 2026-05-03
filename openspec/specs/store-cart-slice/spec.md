## ADDED Requirements

### Requirement: Cart slice exposes itemCount
The cart slice SHALL expose an `itemCount` field of type `number` that defaults to `0`.

#### Scenario: Default empty cart
- **WHEN** the store is created without any prior actions
- **THEN** `itemCount` SHALL be `0`

#### Scenario: Count updated after setCartCount
- **WHEN** `setCartCount(3)` is called
- **THEN** `itemCount` SHALL be `3`

### Requirement: setCartCount action updates item count
The cart slice SHALL expose a `setCartCount(count: number)` action that sets `itemCount` to the provided value.

#### Scenario: Set cart count to positive number
- **WHEN** `setCartCount(5)` is called
- **THEN** `itemCount` SHALL be `5`

#### Scenario: Set cart count to zero
- **WHEN** `setCartCount(0)` is called
- **THEN** `itemCount` SHALL be `0`

### Requirement: clearCart action resets cart state
The cart slice SHALL expose a `clearCart()` action that sets `itemCount` to `0`.

#### Scenario: Clear cart after items added
- **WHEN** `setCartCount(7)` has been called, then `clearCart()` is called
- **THEN** `itemCount` SHALL be `0`

### Requirement: Cart slice does not hold cart items array
The cart slice SHALL NOT include a full items array, cart total, or any server-fetched cart data. Per ADR-002, full cart data belongs in TanStack Query via `@mfe/api`.

#### Scenario: No items array in cart state
- **WHEN** inspecting the `CartSlice` type definition
- **THEN** there SHALL be no `items`, `total`, or `cart` field containing server-fetched data
