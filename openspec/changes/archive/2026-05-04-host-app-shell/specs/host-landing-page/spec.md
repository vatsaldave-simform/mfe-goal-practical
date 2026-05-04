## ADDED Requirements

### Requirement: Landing page renders at the root path
The host app SHALL render a `LandingPage` component at the `/` route instead of redirecting to `/products`. The component SHALL live at `apps/host/src/pages/landing.tsx`.

#### Scenario: Root path renders landing page
- **WHEN** the user navigates to `/`
- **THEN** the `LandingPage` component renders inside the shell layout's main content area

#### Scenario: Landing page is not a redirect
- **WHEN** inspecting the route definition for `/`
- **THEN** it renders the `LandingPage` element directly, not a `<Navigate>` redirect

### Requirement: Landing page displays hero content with navigation links
The `LandingPage` SHALL display a hero section with the store name/tagline, a link/button to browse products (`/products`), and a link to sign in (`/auth/login`).

#### Scenario: Products link is present
- **WHEN** the landing page renders
- **THEN** a prominent link or button labeled "Browse Products" (or similar) navigates to `/products`

#### Scenario: Sign-in link is present
- **WHEN** the landing page renders
- **THEN** a link or button labeled "Sign In" (or similar) navigates to `/auth/login`

### Requirement: Landing page uses semantic design tokens and @mfe/ui primitives
The `LandingPage` SHALL use Tailwind CSS v4 semantic color tokens (e.g., `bg-background`, `text-foreground`) and import UI primitives (`Button`) from `@mfe/ui`.

#### Scenario: No hardcoded colors
- **WHEN** inspecting the CSS classes in `landing.tsx`
- **THEN** all color-related classes use semantic tokens, not hardcoded values like `bg-blue-500`

#### Scenario: UI primitives from @mfe/ui
- **WHEN** inspecting import statements in `landing.tsx`
- **THEN** interactive elements (buttons) are imported from `@mfe/ui`
