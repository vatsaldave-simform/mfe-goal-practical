## ADDED Requirements

### Requirement: Login API error uses toast instead of inline banner
The login form SHALL NOT render an inline error block for API errors. API errors SHALL be communicated via `toast.error(…)`.

#### Scenario: Inline API error block is removed from login form
- **WHEN** the login API call fails
- **THEN** there is no inline error `<div>` rendered above or below the form fields
- **THEN** a `toast.error` notification is displayed instead

### Requirement: Register API error uses toast instead of inline banner
The register form SHALL NOT render an inline error block for API errors. API errors SHALL be communicated via `toast.error(…)`. On success, `toast.success("Account created!")` SHALL be displayed.

#### Scenario: Inline API error block is removed from register form
- **WHEN** the register API call fails
- **THEN** there is no inline error `<div>` rendered above or below the form fields
- **THEN** a `toast.error` notification is displayed instead

#### Scenario: Register success shows toast
- **WHEN** the register API call succeeds
- **THEN** a `toast.success` notification is displayed
