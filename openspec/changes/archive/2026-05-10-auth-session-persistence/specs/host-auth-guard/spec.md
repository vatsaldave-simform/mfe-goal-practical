## MODIFIED Requirements

### Requirement: AuthGuard component redirects unauthenticated users
The host app SHALL provide an `AuthGuard` component at `apps/host/src/components/auth-guard.tsx` that reads `isAuthenticated` from the Zustand store (`@mfe/store`) and conditionally renders its children or redirects to the login page. The guard SHALL only make redirect decisions after the `AuthInitializer` has resolved the session check — it SHALL NOT redirect to login while the session check is still pending.

#### Scenario: Unauthenticated user is redirected to login
- **WHEN** a user who is not authenticated navigates to a route wrapped in `AuthGuard` AND the `AuthInitializer` has finished loading
- **THEN** the browser URL changes to `/auth/login` via `<Navigate to="/auth/login" replace />`

#### Scenario: Authenticated user sees the protected content
- **WHEN** a user who is authenticated navigates to a route wrapped in `AuthGuard`
- **THEN** the `AuthGuard` renders its `children` without any redirect

#### Scenario: Guard does not redirect during session initialization
- **WHEN** the app has just mounted and `AuthInitializer` is still fetching `/auth/me`
- **THEN** `AuthGuard` does not render and does not redirect, because `AuthInitializer` is blocking route rendering
