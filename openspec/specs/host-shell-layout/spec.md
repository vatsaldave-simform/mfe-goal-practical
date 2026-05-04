## ADDED Requirements

### Requirement: Shell layout provides a fixed top navbar and main content area
The host app SHALL render a `ShellLayout` component that contains a fixed-position top navbar and a main content area below it where route content (remote MFEs) renders.

#### Scenario: ShellLayout structure
- **WHEN** inspecting `apps/host/src/components/shell-layout.tsx`
- **THEN** it renders a flex column layout with a `<Navbar />` at the top and a `<main>` element that receives children (route content)

#### Scenario: Main content area fills remaining viewport
- **WHEN** the shell layout renders
- **THEN** the main content area uses flex-grow to fill the remaining viewport height below the navbar

### Requirement: Navbar displays the application logo
The navbar SHALL display a logo/brand element on the left side that links to the home page (`/products`).

#### Scenario: Logo is visible and clickable
- **WHEN** the navbar renders
- **THEN** a logo element (icon + text "MFE Store") is visible on the left side and clicking it navigates to `/products`

### Requirement: Navbar displays navigation links
The navbar SHALL display navigation links for the primary sections: "Products" (`/products`), "Cart" (`/cart`), and conditionally "Orders" (`/orders`) when authenticated.

#### Scenario: Navigation links are present for all users
- **WHEN** the navbar renders
- **THEN** links for "Products" and "Cart" are visible

#### Scenario: Orders link shown when authenticated
- **WHEN** the Zustand store's `isAuthenticated` is `true`
- **THEN** an "Orders" navigation link to `/orders` is also visible in the navbar

#### Scenario: Orders link hidden when not authenticated
- **WHEN** the Zustand store's `isAuthenticated` is `false`
- **THEN** no "Orders" navigation link is displayed

#### Scenario: Active navigation link is visually distinct
- **WHEN** the user is on a page that matches a nav link's path
- **THEN** that nav link has a visually distinct style (e.g., different text color) compared to inactive links

### Requirement: Navbar displays a cart icon with badge
The navbar SHALL display a shopping cart icon on the right side with a badge showing the current item count from the Zustand store.

#### Scenario: Cart icon is visible
- **WHEN** the navbar renders
- **THEN** a shopping cart icon (`ShoppingCart` from lucide-react) is visible on the right side of the navbar

#### Scenario: Cart badge shows item count
- **WHEN** the Zustand store's `itemCount` is greater than 0
- **THEN** a `Badge` component displays the count next to or overlaid on the cart icon

#### Scenario: Cart badge is hidden when empty
- **WHEN** the Zustand store's `itemCount` is 0
- **THEN** no badge is displayed on the cart icon

#### Scenario: Cart icon navigates to cart page
- **WHEN** the user clicks the cart icon
- **THEN** the browser navigates to `/cart`

### Requirement: Navbar displays an account icon
The navbar SHALL display auth-aware account controls on the right side. When the user is **not authenticated**, it SHALL show a "Login" link (with `User` icon) navigating to `/auth/login`. When the user **is authenticated**, it SHALL show a user indicator (display name or icon) and a "Logout" button.

#### Scenario: Unauthenticated user sees Login link
- **WHEN** the Zustand store's `isAuthenticated` is `false`
- **THEN** the navbar shows a "Login" link (with `User` icon from lucide-react) that navigates to `/auth/login`

#### Scenario: Authenticated user sees user info and Logout
- **WHEN** the Zustand store's `isAuthenticated` is `true` and `user` is populated
- **THEN** the navbar shows the user's display name (or first letter) and a "Logout" button

#### Scenario: Logout button clears auth state
- **WHEN** the authenticated user clicks the "Logout" button
- **THEN** the `useLogout` mutation from `@mfe/api` is invoked, and on success `clearAuth()` is called on the store, and the user is navigated to `/auth/login`

### Requirement: Shell layout uses semantic color tokens
The shell layout and navbar SHALL use Tailwind CSS v4 semantic color tokens (e.g., `bg-background`, `text-foreground`, `border-border`) rather than hardcoded color values.

#### Scenario: No hardcoded colors in shell components
- **WHEN** inspecting CSS classes in `shell-layout.tsx` and `navbar.tsx`
- **THEN** all color-related classes use semantic tokens from the design system (e.g., `bg-background`, `text-muted-foreground`, `border-border`)

### Requirement: Shell components use @mfe/ui primitives
The shell layout and navbar SHALL import UI primitives (Button, Badge, Separator, etc.) from `@mfe/ui` rather than building custom equivalents.

#### Scenario: UI imports come from @mfe/ui
- **WHEN** inspecting import statements in `apps/host/src/components/navbar.tsx`
- **THEN** components like `Button`, `Badge` are imported from `@mfe/ui`

### Requirement: Shell components live in apps/host/src/components/
The shell layout and navbar components SHALL be located in the host app's `src/components/` directory, not in `packages/ui`, because they are host-specific (not shared).

#### Scenario: Components are host-local
- **WHEN** inspecting `apps/host/src/components/`
- **THEN** it contains `shell-layout.tsx` and `navbar.tsx` (and optionally `remote-error-boundary.tsx`)
