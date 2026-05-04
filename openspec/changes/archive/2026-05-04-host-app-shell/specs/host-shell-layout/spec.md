## MODIFIED Requirements

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
