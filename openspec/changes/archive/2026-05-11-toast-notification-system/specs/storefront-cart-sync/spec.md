## ADDED Requirements

### Requirement: Add to cart mutation surfaces toast callbacks
The `useAddToCart` mutation SHALL accept and forward `onSuccess`/`onError` callbacks at the call site so consumers can trigger `toast.success`/`toast.error` with contextual messages.

#### Scenario: Add to cart call site can provide toast callbacks
- **WHEN** a component calls `useAddToCart` with `onSuccess` and `onError` callbacks
- **THEN** `onSuccess` is called when the mutation succeeds
- **THEN** `onError` is called when the mutation fails

### Requirement: Remove from cart mutation surfaces toast callbacks
The `useRemoveFromCart` mutation SHALL accept and forward `onSuccess`/`onError` callbacks at the call site.

#### Scenario: Remove from cart call site can provide toast callbacks
- **WHEN** a component calls `useRemoveFromCart` with `onSuccess` and `onError` callbacks
- **THEN** `onSuccess` is called when the mutation succeeds
- **THEN** `onError` is called when the mutation fails
