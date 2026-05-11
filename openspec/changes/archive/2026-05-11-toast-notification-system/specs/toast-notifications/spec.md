## ADDED Requirements

### Requirement: `toast` is importable from `@mfe/ui`
The `packages/ui` barrel export SHALL re-export `toast` from `sonner` so all MFEs import it via `import { toast } from "@mfe/ui"`.

#### Scenario: `toast` is available from @mfe/ui barrel
- **WHEN** any MFE imports `{ toast }` from `"@mfe/ui"`
- **THEN** the import resolves without error and `toast.*` functions are callable

### Requirement: Login failure shown as toast
When login fails due to an API error, the system SHALL display a `toast.error(…)` notification and SHALL NOT render an inline error banner above the form.

#### Scenario: Login API error triggers toast
- **WHEN** the user submits the login form and the API returns an error
- **THEN** a toast error notification is displayed with the server error message or fallback text
- **THEN** no inline error banner is rendered inside the form

### Requirement: Registration failure shown as toast
When registration fails due to an API error, the system SHALL display a `toast.error(…)` notification and SHALL NOT render an inline error banner above the form.

#### Scenario: Register API error triggers toast
- **WHEN** the user submits the register form and the API returns an error
- **THEN** a toast error notification is displayed with the server error message or fallback text

### Requirement: Registration success shown as toast
When registration succeeds, the system SHALL display a `toast.success("Account created!")` notification.

#### Scenario: Register success triggers toast
- **WHEN** the user successfully registers
- **THEN** a toast success notification is displayed

### Requirement: Add to cart feedback shown as toast
When an item is successfully added to the cart, the system SHALL display a `toast.success(…)` notification. On failure, the system SHALL display a `toast.error(…)` notification.

#### Scenario: Add to cart success triggers toast
- **WHEN** the user adds a product to the cart and the mutation succeeds
- **THEN** a toast success notification is displayed

#### Scenario: Add to cart failure triggers toast
- **WHEN** the user adds a product to the cart and the mutation fails
- **THEN** a toast error notification is displayed

### Requirement: Remove from cart feedback shown as toast
When a cart item is removed, the system SHALL display a `toast.success(…)` notification. On failure, the system SHALL display a `toast.error(…)` notification.

#### Scenario: Remove from cart success triggers toast
- **WHEN** the user removes an item from the cart and the mutation succeeds
- **THEN** a toast success notification is displayed

#### Scenario: Remove from cart failure triggers toast
- **WHEN** the user removes an item from the cart and the mutation fails
- **THEN** a toast error notification is displayed

### Requirement: Order placement feedback shown as toast
When an order is placed successfully, the system SHALL display a `toast.success("Order placed!")` notification. On failure, the system SHALL display a `toast.error(…)` notification.

#### Scenario: Order placement success triggers toast
- **WHEN** the user submits the checkout form and the order is created
- **THEN** a toast success notification is displayed

#### Scenario: Order placement failure triggers toast
- **WHEN** the user submits the checkout form and the API returns an error
- **THEN** a toast error notification is displayed

### Requirement: Logout confirmation shown as toast
When the user logs out, the system SHALL display a `toast.success("Logged out")` notification.

#### Scenario: Logout triggers toast
- **WHEN** the user triggers the logout action
- **THEN** a toast success notification is displayed with a logout confirmation message

### Requirement: Form field validation errors remain inline
The system SHALL preserve `<FieldError>` components for per-field validation errors. Field-level errors SHALL NOT be migrated to toasts.

#### Scenario: Validation error stays inline
- **WHEN** the user submits a form with an invalid field value
- **THEN** the field error message is displayed inline below the corresponding field
- **THEN** no toast is triggered for field validation errors
