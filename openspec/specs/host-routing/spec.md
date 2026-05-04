## ADDED Requirements

### Requirement: Host owns the single BrowserRouter instance
The host app SHALL wrap its root component in a `BrowserRouter` from `react-router` in the bootstrap entry layer (`src/bootstrap.tsx`), providing the single router context for the entire application. Note: `src/index.tsx` is a thin async-shim required by Module Federation for shared module negotiation; the actual render logic lives in `src/bootstrap.tsx`.

#### Scenario: BrowserRouter is rendered at entry point
- **WHEN** inspecting `apps/host/src/bootstrap.tsx` (the MF async-bootstrap entry)
- **THEN** the `<App />` component is wrapped in `<BrowserRouter>` from `react-router`

#### Scenario: No other app creates a BrowserRouter
- **WHEN** searching all source files across `apps/storefront/` and `apps/account/`
- **THEN** no file imports or renders `BrowserRouter`, `HashRouter`, or `MemoryRouter`

### Requirement: Host defines route configuration for storefront remote
The host app SHALL define routes that map URL paths to lazily-loaded storefront remote components.

#### Scenario: Products route loads storefront remote
- **WHEN** the user navigates to `/products` or any sub-path `/products/*`
- **THEN** the host lazily loads the storefront remote's App component via `React.lazy(() => import("storefront/App"))`

#### Scenario: Cart route loads storefront remote
- **WHEN** the user navigates to `/cart`
- **THEN** the host lazily loads the storefront remote's App component via `React.lazy(() => import("storefront/App"))`

### Requirement: Host defines route configuration for account remote
The host app SHALL define routes that map URL paths to lazily-loaded account remote components.

#### Scenario: Auth routes load account remote
- **WHEN** the user navigates to `/auth` or any sub-path `/auth/*`
- **THEN** the host lazily loads the account remote's App component via `React.lazy(() => import("account/App"))`

#### Scenario: Account routes load account remote
- **WHEN** the user navigates to `/account` or any sub-path `/account/*`
- **THEN** the host lazily loads the account remote's App component via `React.lazy(() => import("account/App"))`

### Requirement: Root path redirects to products
The host app SHALL redirect the root path `/` to `/products` so users land on the product listing by default.

#### Scenario: Root redirect
- **WHEN** the user navigates to `/`
- **THEN** the browser URL changes to `/products` and the storefront remote loads

### Requirement: Each lazy-loaded route has a Suspense boundary
Each route that lazy-loads a remote MFE component SHALL be wrapped in its own `<Suspense>` boundary with a loading fallback.

#### Scenario: Suspense wrapper around remote routes
- **WHEN** a remote module is being fetched (e.g., storefront/App)
- **THEN** a loading fallback (Skeleton or spinner) is displayed in the main content area while the navbar remains interactive

### Requirement: Remote load failures are caught by an error boundary
Each lazy-loaded remote route SHALL be wrapped in an error boundary that catches chunk load failures and displays a user-friendly error message with a retry option.

#### Scenario: Remote unavailable shows error fallback
- **WHEN** a remote's MF manifest or module fails to load (e.g., storefront dev server is not running)
- **THEN** the error boundary renders a message like "This section is currently unavailable" with a "Try again" button

#### Scenario: Retry reloads the remote
- **WHEN** the user clicks the "Try again" button in the error boundary
- **THEN** the error boundary resets and attempts to reload the remote component

### Requirement: Route definitions live in a dedicated routes file
The host app SHALL organize route definitions in `apps/host/src/routes/index.tsx`, keeping `App.tsx` focused on layout composition.

#### Scenario: Routes are defined in routes/index.tsx
- **WHEN** inspecting `apps/host/src/routes/index.tsx`
- **THEN** it exports route elements or a route configuration that maps paths to lazy-loaded remote components
