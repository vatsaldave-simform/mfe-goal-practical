## MODIFIED Requirements

### Requirement: Landing page displays hero content with navigation links
The `LandingPage` SHALL display a hero section with the store name/tagline and contextually appropriate CTAs based on the user's authentication state. When the user is authenticated, the "Sign In" CTA SHALL be replaced with a "My Account" link. When unauthenticated, the "Sign In" CTA SHALL be shown.

#### Scenario: Unauthenticated user sees Sign In CTA
- **WHEN** the landing page renders and `isAuthenticated` is `false`
- **THEN** a link or button labeled "Sign In" (or similar) navigating to `/auth/login` is visible

#### Scenario: Authenticated user sees My Account CTA instead of Sign In
- **WHEN** the landing page renders and `isAuthenticated` is `true`
- **THEN** a link or button navigating to `/account` is visible and the "Sign In" button is NOT rendered

#### Scenario: Products link is always present
- **WHEN** the landing page renders regardless of auth state
- **THEN** a prominent link or button labeled "Browse Products" (or similar) navigating to `/products` is visible

### Requirement: Landing page reads auth state from Zustand store
The `LandingPage` SHALL read `isAuthenticated` from `@mfe/store` to determine which CTAs to render. It SHALL NOT make any API calls directly.

#### Scenario: LandingPage uses store selector for auth state
- **WHEN** inspecting the `LandingPage` component implementation
- **THEN** it calls `useStore` with a selector for `isAuthenticated` and does not import `apiClient` or make any fetch/axios calls
