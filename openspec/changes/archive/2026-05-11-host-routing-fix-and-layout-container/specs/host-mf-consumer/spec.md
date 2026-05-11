## MODIFIED Requirements

### Requirement: Host routes correctly partition auth, account, and orders paths

The host must mount each account MFE component under its correct base path with the correct guard.

#### Scenario: /auth/* only serves guest routes

- **WHEN** a user navigates to `/auth/login` or `/auth/register`
- **THEN** the host renders `account/AuthApp` wrapped in `GuestGuard`
- **WHEN** a user navigates to `/auth/profile` or any other non-auth path under `/auth/`
- **THEN** no route matches (404 or no render)

#### Scenario: /account/* serves authenticated profile

- **WHEN** an authenticated user navigates to `/account/profile`
- **THEN** the host renders `account/App` wrapped in `AuthGuard`
- **WHEN** an unauthenticated user navigates to `/account/profile`
- **THEN** `AuthGuard` redirects to `/auth/login`

#### Scenario: /orders/* serves authenticated orders

- **WHEN** an authenticated user navigates to `/orders`
- **THEN** the host renders `account/OrdersApp` wrapped in `AuthGuard`, showing the orders list
- **WHEN** an authenticated user navigates to `/orders/:id`
- **THEN** the host renders `account/OrdersApp` wrapped in `AuthGuard`, showing the order detail
- **WHEN** an unauthenticated user navigates to `/orders` or `/orders/:id`
- **THEN** `AuthGuard` redirects to `/auth/login`

#### Scenario: Skeleton fallbacks are constrained by PageContainer

- **WHEN** any MFE route is loading (Suspense fallback)
- **THEN** the `RemoteSkeleton` renders inside `PageContainer`, with max-width constraint applied
