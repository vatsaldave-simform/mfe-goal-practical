## ADDED Requirements

### Requirement: AuthInitializer component rehydrates auth state on app mount
The host app SHALL provide an `AuthInitializer` component at `apps/host/src/components/auth-initializer.tsx` that calls `useMe` on mount and syncs the result into the Zustand `auth` slice via `setAuth` or `clearAuth`.

#### Scenario: Valid session cookie rehydrates the store
- **WHEN** the app mounts and a valid httpOnly JWT cookie exists in the browser
- **THEN** `AuthInitializer` calls `useMe`, and on success calls `setAuth(data.user)`, setting `isAuthenticated: true` in the store

#### Scenario: No session cookie results in cleared store
- **WHEN** the app mounts and no valid JWT cookie exists (or the cookie is expired)
- **THEN** `useMe` returns a 401 error and `AuthInitializer` calls `clearAuth()`, leaving `isAuthenticated: false` in the store

#### Scenario: AuthInitializer renders nothing while loading
- **WHEN** the `useMe` query is in-flight (pending state)
- **THEN** `AuthInitializer` renders `null` and does not render its `children`

#### Scenario: AuthInitializer renders children after resolution
- **WHEN** the `useMe` query settles (either success or error)
- **THEN** `AuthInitializer` renders its `children`

### Requirement: AuthInitializer is mounted at the app root before routes
The `AuthInitializer` component SHALL wrap `App` in `apps/host/src/bootstrap.tsx` so that routes are not rendered until the session check has resolved.

#### Scenario: Routes do not render during session check
- **WHEN** the app first mounts and `useMe` is pending
- **THEN** no `<Route>` elements are rendered, preventing `AuthGuard` from reading stale store state

#### Scenario: AuthInitializer is inside ApiProvider and BrowserRouter
- **WHEN** inspecting `bootstrap.tsx`
- **THEN** `AuthInitializer` is a descendant of `ApiProvider` and `BrowserRouter` so it has access to the query client and router context

### Requirement: useMe is configured with retry disabled and a 5-minute staleTime
The `useMe` call inside `AuthInitializer` SHALL use `retry: false` and `staleTime: 5 * 60 * 1000`.

#### Scenario: No retry on 401
- **WHEN** `useMe` receives a 401 response at startup
- **THEN** the query does not retry, and the error state is set immediately

#### Scenario: staleTime prevents redundant refetches
- **WHEN** the user focuses a window within 5 minutes of a successful session check
- **THEN** `useMe` does not refetch because the result is still fresh

### Requirement: GuestGuard redirects authenticated users away from auth pages
The host route configuration SHALL redirect authenticated users who navigate to `/auth/login` or `/auth/register` to `/account`.

#### Scenario: Authenticated user visiting /auth/login is redirected
- **WHEN** an authenticated user navigates to `/auth/login`
- **THEN** the browser redirects to `/account` via `<Navigate to="/account" replace />`

#### Scenario: Authenticated user visiting /auth/register is redirected
- **WHEN** an authenticated user navigates to `/auth/register`
- **THEN** the browser redirects to `/account` via `<Navigate to="/account" replace />`

#### Scenario: Unauthenticated user can access auth pages normally
- **WHEN** an unauthenticated user navigates to `/auth/login` or `/auth/register`
- **THEN** the page renders normally without any redirect
