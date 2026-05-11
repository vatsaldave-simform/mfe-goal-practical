## ADDED Requirements

### Requirement: Cart item removal shows toast feedback
When the user removes an item from the cart, the system SHALL display a success or error toast confirming the outcome.

#### Scenario: Remove item success toast
- **WHEN** the user removes an item from the cart and the mutation succeeds
- **THEN** a `toast.success` notification is displayed

#### Scenario: Remove item failure toast
- **WHEN** the user removes an item from the cart and the mutation fails
- **THEN** a `toast.error` notification is displayed

### Requirement: Checkout order placement shows toast feedback
The checkout page SHALL display `toast.success("Order placed!")` on successful order creation and `toast.error(…)` on failure, instead of or in addition to the existing inline error.

#### Scenario: Checkout success shows toast
- **WHEN** the user completes checkout and the order is created
- **THEN** a `toast.success` notification is displayed

#### Scenario: Checkout failure shows toast
- **WHEN** the checkout API call fails
- **THEN** a `toast.error` notification is displayed
