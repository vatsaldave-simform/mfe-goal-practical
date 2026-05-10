## Why

On page refresh, the Zustand auth store resets to `{ isAuthenticated: false, user: null }` — despite a valid httpOnly JWT cookie existing in the browser. Nothing calls `/auth/me` at app startup to rehydrate the store, so the navbar shows "Sign In", `AuthGuard` redirects authenticated users to login, and the landing page always renders a "Sign In" CTA regardless of session state.

## What Changes

- **New `AuthInitializer` component** in the host shell that calls `useMe` on mount and syncs the result into the Zustand `auth` slice before routes are rendered
- **`AuthGuard` update** to respect a loading state during session initialization, preventing a premature redirect to `/auth/login` while `useMe` is in-flight
- **Landing page update** to conditionally hide the "Sign In" button and instead show a "My Account" CTA when the user is already authenticated
- **Route guard for auth pages** (`/auth/login`, `/auth/register`) to redirect already-authenticated users away so they can't navigate back to those pages while logged in

## Capabilities

### New Capabilities

- `auth-initializer`: Bootstrap component that reconciles the httpOnly cookie session with the Zustand auth store on app startup, providing a single source of truth for auth state across the entire shell

### Modified Capabilities

- `host-auth-guard`: Requirement change — guard must handle a third "loading" state in addition to authenticated/unauthenticated, to prevent false redirects during session hydration
- `host-landing-page`: Requirement change — landing page must be auth-aware and show contextually appropriate CTAs based on session state

## Impact

- `apps/host/src/` — new `AuthInitializer` component, updates to `auth-guard`, `landing`, and `bootstrap`/`App`
- `packages/api/src/queries/auth.ts` — `useMe` hook used (already exists, no changes needed)
- `packages/store/src/slices/auth.ts` — `setAuth`/`clearAuth` used (already exists, no changes needed)
- No backend changes required — `/auth/me` endpoint already exists and validates the httpOnly cookie
- No new dependencies — leverages existing TanStack Query + Zustand infrastructure

## Non-goals

- Persisting auth state to `localStorage` or `sessionStorage` — the httpOnly cookie is the source of truth; Zustand is derived state only
- Implementing token refresh / silent re-auth — out of scope; 401 interceptor in `@mfe/api` already handles session expiry
- Changes to the account MFE auth pages themselves (login form, register form) — only the host shell is in scope
- Making `useMe` available to non-host MFEs at startup — the host initializes once and the shared Zustand singleton propagates auth state to all remotes

## Skills

- `tanstack-query-best-practices` — `useMe` query configuration (staleTime, retry, error handling)
- `zustand` — syncing query result into auth slice
- `vercel-react-best-practices` — component design for `AuthInitializer`, avoiding re-render issues
