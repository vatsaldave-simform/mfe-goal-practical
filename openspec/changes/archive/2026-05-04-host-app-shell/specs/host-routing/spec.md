## ADDED Requirements

### Requirement: Host defines route configuration for orders remote
The host app SHALL define a route that maps the `/orders/*` URL path to the lazily-loaded account remote component, wrapped in `AuthGuard`, `RemoteErrorBoundary`, and `Suspense`.

#### Scenario: Orders route loads account remote
- **WHEN** the user navigates to `/orders` or any sub-path `/orders/*`
- **THEN** the host lazily loads the account remote's App component via `React.lazy(() => import("account/App"))`

#### Scenario: Orders route is protected by AuthGuard
- **WHEN** an unauthenticated user navigates to `/orders`
- **THEN** the `AuthGuard` redirects them to `/auth/login` before attempting to load the remote

### Requirement: Account routes are protected by AuthGuard
The host app SHALL wrap the `/account/*` route element in `AuthGuard` so only authenticated users can access account pages.

#### Scenario: Account route is protected
- **WHEN** an unauthenticated user navigates to `/account/profile`
- **THEN** the `AuthGuard` redirects them to `/auth/login`

#### Scenario: Authenticated user accesses account
- **WHEN** an authenticated user navigates to `/account/profile`
- **THEN** the account remote loads normally inside `Suspense` and `RemoteErrorBoundary`

## MODIFIED Requirements

### Requirement: Root path redirects to products
The host app SHALL render a `LandingPage` component at `/` instead of redirecting to `/products`.

#### Scenario: Root path renders landing page
- **WHEN** the user navigates to `/`
- **THEN** the `LandingPage` component renders in the main content area (no redirect occurs)
