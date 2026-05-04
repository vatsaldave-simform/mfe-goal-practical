## Why

The host shell has its foundational wiring (BrowserRouter, layout, MF consumer config, lazy-loaded routes, error boundaries) but is missing key runtime pieces that make it a functional application shell: there is no `QueryClientProvider` mounted so TanStack Query hooks fail at runtime, no auth guard to protect private routes, the navbar is static (always shows a login icon instead of reacting to auth state), and the `/orders/*` route is absent. Without these, end-to-end flows (browse → login → view orders → logout) cannot work even when the remotes ship real content.

## What Changes

- Mount `ApiProvider` (TanStack `QueryClientProvider`) at the root in `bootstrap.tsx` so every MFE inherits the shared `QueryClient`
- Add an `AuthGuard` component that reads `isAuthenticated` from `@mfe/store` and redirects unauthenticated users to `/auth/login`
- Wrap `/account/*` and `/orders/*` routes in `AuthGuard`
- Add the missing `/orders/*` route mapped to `lazy(AccountMFE)`
- Make `/` render a simple landing/dashboard page instead of an unconditional redirect to `/products`
- Update the navbar to be auth-aware: show **Login** link when logged out and **user indicator + Logout** action when logged in
- Ensure every lazy-loaded route has both `<Suspense>` and `<RemoteErrorBoundary>` (already true — verify only)

## Capabilities

### New Capabilities
- `host-query-provider`: Mounting the shared `ApiProvider` at the root of the host app so all MFEs access a single `QueryClient` instance
- `host-auth-guard`: An `AuthGuard` wrapper component that checks `isAuthenticated` and redirects to `/auth/login`, applied to protected route groups
- `host-landing-page`: A lightweight landing/dashboard page rendered at `/` with links to products and account

### Modified Capabilities
- `host-routing`: Adding `/orders/*` → `AccountMFE`, wrapping protected routes in `AuthGuard`, and changing `/` from a redirect to a landing page
- `host-shell-layout`: Navbar becomes auth-aware — dynamically shows login link vs. user info + logout based on store state

## Non-goals

- Implementing actual page content inside the storefront or account MFEs (they stay as placeholders until their own changes land)
- Wiring the remotes' `exposes` config — that belongs to each remote's own change
- Persisting auth state across hard refreshes (the `/auth/me` bootstrap query is a separate concern)
- Adding route-level code-splitting beyond what `React.lazy` already provides
- Dark mode toggle or theme switching in the navbar

## Impact

- **apps/host/src/bootstrap.tsx** — wraps app tree with `ApiProvider`
- **apps/host/src/components/auth-guard.tsx** — new file
- **apps/host/src/components/navbar.tsx** — auth-aware nav items (login/logout)
- **apps/host/src/routes/index.tsx** — add `/orders/*`, `/` landing page, `AuthGuard` wrappers
- **apps/host/src/pages/landing.tsx** — new simple landing page
- **packages/api** consumed at runtime (already a dependency)
- **packages/store** consumed at runtime (already a dependency)
- **ADR-002** (State Management) — navbar reads `isAuthenticated` + `user` from Zustand, no server data in store
- **ADR-003** (Authentication) — AuthGuard relies on Zustand `isAuthenticated`; token stays in httpOnly cookie
- **ADR-004** (Routing) — host owns BrowserRouter; MFEs export route-ready components
- **ADR-005** (MF Shared Singletons) — `@mfe/api` singleton ensures one `QueryClient` across all remotes
- **ADR-006** (API Layer) — `ApiProvider` from `@mfe/api` provides the `QueryClientProvider`

## Skills

- **mf** — MF consumer config, shared singletons, runtime loading
- **tanstack-query-best-practices** — QueryClient setup, provider placement
- **zustand** — reading auth slice in guard & navbar
- **vercel-react-best-practices** — lazy loading, Suspense boundaries, composition
- **shadcn** — UI primitives in navbar and landing page
- **tailwind-design-system** — semantic color tokens in new components
