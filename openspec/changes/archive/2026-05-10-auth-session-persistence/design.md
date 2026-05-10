## Context

The host shell has a complete auth infrastructure — `useMe` query hook, Zustand `auth` slice with `setAuth`/`clearAuth`, `AuthGuard` component, and a navbar that reads `isAuthenticated` from the store. However, the Zustand store is never seeded from the backend session on page load. On every refresh the store cold-starts with `{ isAuthenticated: false, user: null }`, making the app behave as if the user is logged out even when a valid httpOnly JWT cookie is present.

Current flow on refresh:
```
Browser reload
    │
    ▼
Zustand: { isAuthenticated: false, user: null }  ← always cold
    │
    ├── Navbar: shows "Sign In"          ← wrong
    ├── AuthGuard: redirects to /login   ← wrong  
    └── Landing: shows "Sign In" CTA     ← wrong
    
httpOnly cookie ──► nobody reads it until user acts
```

Target flow:
```
Browser reload
    │
    ▼
AuthInitializer mounts in host App.tsx
    │
    ├── pending ──► render null (block routes, prevent race)
    │
    ├── success ──► setAuth(data.user) ──► Zustand updated
    │                   │
    │                   ▼
    │               Routes render with correct auth state
    │               Navbar: shows user name + logout   ✓
    │               AuthGuard: passes through          ✓
    │               Landing: shows "My Account" CTA    ✓
    │
    └── error (401) ──► clearAuth() ──► cold state confirmed correct
                            │
                            ▼
                        Routes render as unauthenticated  ✓
```

## Goals / Non-Goals

**Goals:**
- Rehydrate Zustand auth state from `/auth/me` on every app mount (covers refresh, new tab, direct URL)
- Block route rendering until session status is resolved to prevent `AuthGuard` race conditions
- Make the landing page and navbar auth-aware with zero flicker
- Redirect authenticated users away from `/auth/login` and `/auth/register`

**Non-Goals:**
- Token refresh / silent re-auth (the 401 interceptor in `@mfe/api` handles session expiry)
- Persisting Zustand state to localStorage (httpOnly cookie is the source of truth)
- Modifying any MFE other than the host shell
- Changing the backend

## Decisions

### Decision 1: `AuthInitializer` — sync component, blocks children until resolved

**Choice:** `AuthInitializer` renders `null` while `useMe` is loading, then renders its `children` after the query settles (success or error).

**Rationale:** The simplest approach without introducing new context or state. The host already uses Suspense + skeleton patterns at route boundaries — a null-while-loading initializer at the app root is consistent. It prevents `AuthGuard` from seeing `isAuthenticated: false` and immediately redirecting before `useMe` has responded.

**Alternative considered:** Optimistic rendering with a `loading` state in `AuthGuard`. Rejected — adds a third state (`"idle" | "loading" | "authenticated"`) to the guard, complicating every route guard in the app. The blocking approach is simpler.

**Ownership:** `apps/host/src/components/auth-initializer.tsx`

```
bootstrap.tsx
└── ApiProvider
    └── BrowserRouter
        └── AuthInitializer  ← NEW: gates route rendering
            └── App.tsx
                └── ShellLayout
                    └── AppRoutes
```

### Decision 2: `useMe` configuration in `AuthInitializer`

**Choice:** Call `useMe` with `retry: false`, `staleTime: 5 * 60 * 1000` (5 min).

**Rationale (per tanstack-query-best-practices):**
- `retry: false` — a 401 is definitive; retrying adds startup delay with no benefit
- `staleTime: 5 min` — avoids unnecessary refetches on focus/tab-switch during a session; `/auth/me` is cheap but there's no value in spamming it

**Ownership:** `apps/host/src/components/auth-initializer.tsx`

### Decision 3: Sync `useMe` result to Zustand via `useEffect`

**Choice:** Use `useEffect` watching `data` and `isError` to call `setAuth` / `clearAuth`.

**Rationale:** Per ADR-002, Zustand holds derived auth state, not server data. The query is the source of truth, Zustand is the subscriber. A `useEffect` cleanly expresses this relationship. On success → `setAuth(data.user)`. On error → `clearAuth()` (session expired or invalid cookie).

**Rationale (per vercel-react-best-practices):** Do NOT call `setAuth` inside `onSuccess` callback — TanStack Query v5 removed `onSuccess` from `useQuery`. Use `useEffect` on the data/error results instead.

### Decision 4: Route guard for auth pages (redirect-if-authenticated)

**Choice:** Add a `GuestGuard` or inline redirect inside the `/auth/*` `<Route>` element that sends authenticated users to `/account`.

**Rationale:** Without this, a logged-in user can manually navigate to `/auth/login` and see the login form. The guard logic mirrors `AuthGuard` but inverted — "if authenticated, go away."

**Ownership:** `apps/host/src/routes/index.tsx`

### Decision 5: Landing page — conditional CTA

**Choice:** Read `isAuthenticated` from the store in `LandingPage` and swap the "Sign In" button for "My Account".

**Rationale:** Consistent with the existing pattern — the navbar already does this same conditional. No new pattern or abstraction needed.

**Ownership:** `apps/host/src/pages/landing.tsx`

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Startup latency — `useMe` adds a network round-trip before any routes render | `/auth/me` is a lightweight endpoint (JWT verify only, no DB). Backend is local in dev. Acceptable trade-off. In production, add a loading spinner at the `AuthInitializer` level. |
| Race if `useMe` network is very slow in production | `AuthInitializer` renders null so no stale redirect happens. UX shows blank briefly — acceptable over a wrong redirect. Can be improved later with an app-level skeleton. |
| MFE remotes load before `AuthInitializer` resolves | They don't — `AuthInitializer` blocks `AppRoutes` from rendering, which blocks the `React.lazy()` import triggers |
| `useMe` is 401 intercepted by the axios client and redirects to `/auth/login` before `AuthInitializer` can handle the error | Verify the 401 interceptor does NOT redirect on startup (only on protected API calls). May need to skip redirect if the request is `/auth/me`. |

### Open Question
The 401 interceptor in `packages/api/src/client.ts` may redirect to `/auth/login` on any 401. If it intercepts the startup `/auth/me` 401, it would redirect before `AuthInitializer` clears the store. **Before implementing, check the interceptor and add a bypass for `/auth/me` requests if needed.**

## Migration Plan

No data migration. All changes are additive to the host shell:

1. Add `AuthInitializer` component
2. Wrap `App` with it in `bootstrap.tsx`
3. Update `LandingPage` to be auth-aware
4. Add guest guard to `/auth/*` routes in `AppRoutes`
5. Remove the 401-interceptor redirect for `/auth/me` if it exists (verify first)

Rollback: delete `AuthInitializer`, revert `bootstrap.tsx` wrap — everything else is backward compatible.
