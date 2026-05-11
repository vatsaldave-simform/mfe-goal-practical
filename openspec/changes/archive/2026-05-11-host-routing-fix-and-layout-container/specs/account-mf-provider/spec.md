## MODIFIED Requirements

### Requirement: Account MFE exposes three distinct route entry points

The account MFE must expose separate components for authentication routes, account routes, and orders routes so the host can apply appropriate guards and mount them at correct base paths.

#### Scenario: AuthApp exposes only guest routes

- **WHEN** the host imports `account/AuthApp`
- **THEN** it renders only `login` and `register` routes (relative paths `login`, `register`)
- **AND** it does NOT render `profile`, `orders`, or any detail route

#### Scenario: App exposes only profile route

- **WHEN** the host imports `account/App`
- **THEN** it renders a `profile` relative route (resolves to `/account/profile` when mounted at `/account/*`)
- **AND** it does NOT render `login`, `register`, or orders routes

#### Scenario: OrdersApp exposes only orders routes

- **WHEN** the host imports `account/OrdersApp`
- **THEN** it renders an index route (orders list) and a `:id` route (order detail)
- **AND** the index resolves to `/orders` and `:id` resolves to `/orders/:id` when mounted at `/orders/*`

#### Scenario: module-federation.config.ts declares all three

- **WHEN** the account MFE build runs
- **THEN** `module-federation.config.ts` exposes `"./AuthApp"`, `"./App"`, and `"./OrdersApp"`
