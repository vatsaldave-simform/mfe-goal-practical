## ADDED Requirements

### Requirement: AuthGuard component redirects unauthenticated users
The host app SHALL provide an `AuthGuard` component at `apps/host/src/components/auth-guard.tsx` that reads `isAuthenticated` from the Zustand store (`@mfe/store`) and conditionally renders its children or redirects to the login page.

#### Scenario: Unauthenticated user is redirected to login
- **WHEN** a user who is not authenticated navigates to a route wrapped in `AuthGuard`
- **THEN** the browser URL changes to `/auth/login` via `<Navigate to="/auth/login" replace />`

#### Scenario: Authenticated user sees the protected content
- **WHEN** a user who is authenticated navigates to a route wrapped in `AuthGuard`
- **THEN** the `AuthGuard` renders its `children` without any redirect

### Requirement: AuthGuard reads auth state from Zustand store
The `AuthGuard` SHALL read `isAuthenticated` from `@mfe/store` via `useStore(s => s.isAuthenticated)`. It SHALL NOT make any API calls or read cookies directly.

#### Scenario: AuthGuard uses store selector
- **WHEN** inspecting the `AuthGuard` component implementation
- **THEN** it calls `useStore` with a selector for `isAuthenticated` and does not import `apiClient` or make any fetch/axios calls

### Requirement: AuthGuard is applied to /account/* and /orders/* routes
The host route configuration SHALL wrap the `/account/*` and `/orders/*` route elements in `AuthGuard` so that only authenticated users can access those sections.

#### Scenario: /account/* is protected
- **WHEN** an unauthenticated user navigates to `/account/profile`
- **THEN** the `AuthGuard` redirects them to `/auth/login`

#### Scenario: /orders/* is protected
- **WHEN** an unauthenticated user navigates to `/orders`
- **THEN** the `AuthGuard` redirects them to `/auth/login`

#### Scenario: /auth/* is NOT protected
- **WHEN** an unauthenticated user navigates to `/auth/login` or `/auth/register`
- **THEN** the page renders normally without any redirect

#### Scenario: /products/* is NOT protected
- **WHEN** an unauthenticated user navigates to `/products`
- **THEN** the page renders normally without any redirect
