## ADDED Requirements

### Requirement: Cart page displays all cart items

The storefront SHALL render a `CartPage` at the `/cart` route displaying all items currently in the user's cart with their details.

#### Scenario: Cart with items
- **WHEN** user navigates to `/cart` and has items in their cart
- **THEN** the system SHALL display each cart item with: product name, product image, unit price, quantity, and line total (price × quantity)

#### Scenario: Empty cart
- **WHEN** user navigates to `/cart` and the cart is empty
- **THEN** the system SHALL display an empty state message with a link/button to browse products

### Requirement: Cart page allows quantity adjustment

The `CartPage` SHALL allow users to increase or decrease the quantity of each cart item.

#### Scenario: Increase quantity
- **WHEN** user clicks the increase quantity control on a cart item
- **THEN** the system SHALL call the update cart item mutation with incremented quantity and refresh the cart display

#### Scenario: Decrease quantity above 1
- **WHEN** user clicks the decrease quantity control on a cart item with quantity > 1
- **THEN** the system SHALL call the update cart item mutation with decremented quantity and refresh the cart display

#### Scenario: Decrease quantity to zero removes item
- **WHEN** user decreases quantity to 0 (or clicks a remove button)
- **THEN** the system SHALL call the remove cart item mutation and the item SHALL disappear from the cart

### Requirement: Cart page shows order total

The `CartPage` SHALL display the total cost of all items in the cart.

#### Scenario: Total reflects current items
- **WHEN** the cart page renders or items are modified
- **THEN** the displayed total SHALL equal the sum of all (price × quantity) for items in the cart, using the `total` field from the `CartResponse`

### Requirement: Cart page has remove item action

Each cart item SHALL have a remove button/action that removes it entirely from the cart.

#### Scenario: Remove item
- **WHEN** user clicks the remove action on a cart item
- **THEN** the system SHALL call the remove cart item mutation, the item SHALL be removed from the display, and the total SHALL update

### Requirement: Cart page links to checkout

The `CartPage` SHALL include a "Proceed to Checkout" button that navigates to the checkout page.

#### Scenario: Navigate to checkout
- **WHEN** user clicks "Proceed to Checkout" on the cart page
- **THEN** the app SHALL navigate to the `/checkout` route

#### Scenario: Checkout button disabled when cart empty
- **WHEN** the cart has zero items
- **THEN** the "Proceed to Checkout" button SHALL be disabled or hidden

### Requirement: Checkout page displays order summary

The storefront SHALL render a `CheckoutPage` at the `/checkout` route that displays a summary of the current cart before placing the order.

#### Scenario: Checkout summary shows cart contents
- **WHEN** user navigates to `/checkout`
- **THEN** the system SHALL display the cart items, quantities, and total (using cached cart data from TanStack Query)

### Requirement: Checkout page places order

The `CheckoutPage` SHALL include a "Place Order" button that creates an order from the current cart.

#### Scenario: Place order succeeds
- **WHEN** user clicks "Place Order" on the checkout page
- **THEN** the system SHALL call `useCreateOrder` mutation (POST /orders), and on success navigate to a confirmation view or redirect to the orders page

#### Scenario: Place order shows loading state
- **WHEN** the place order mutation is in progress
- **THEN** the "Place Order" button SHALL show a loading/disabled state to prevent double-submission

#### Scenario: Place order fails
- **WHEN** the place order mutation fails (e.g., network error)
- **THEN** the system SHALL display an error message and allow the user to retry
