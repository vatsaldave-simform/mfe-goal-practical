## Context

The host shell (`apps/host`) already has the foundational pieces in place:

- `BrowserRouter` in `bootstrap.tsx`
- `ShellLayout` → `Navbar` + `<main>` in `components/`
- Lazy-loaded routes for storefront (`/products/*`, `/cart`) and account (`/auth/*`, `/account/*`) in `routes/index.tsx`
- `RemoteErrorBoundary` wrapping each lazy route
- Zustand store (`@mfe/store`) with `AuthSlice` and `CartSlice`
- API layer (`@mfe/api`) with `ApiProvider` exporting a pre-configured `QueryClientProvider`

**What's missing** at runtime:

1. `ApiProvider` is never mounted → TanStack Query hooks crash.
2. No auth guard → protected routes (`/account/*`, `/orders/*`) are accessible to unauthenticated users.
3. `/orders/*` route is undefined.
4. `/` does an unconditional redirect to `/products` — no landing page.
5. Navbar is static — always shows a login icon; no logout action or user indicator.

This change fills those gaps so the host shell is fully functional for end-to-end user flows.

## Goals / Non-Goals

**Goals:**
- Mount `ApiProvider` once, above all routes, so every MFE and host component shares a single `QueryClient` (per ADR-005, ADR-006)
- Add a client-side `AuthGuard` that redirects to `/auth/login` when `isAuthenticated === false` (per ADR-003)
- Complete the route table: add `/orders/*`, change `/` to a landing page
- Make the navbar auth-aware: read `isAuthenticated` + `user` from `@mfe/store`

**Non-Goals:**
- Bootstrap auth hydration (`/auth/me` call on startup to restore session after hard refresh) — separate concern
- Remote `exposes` config — owned by each MFE's change
- Server-side rendering or initial server auth check
- Persistent "return to" URL after login redirect (nice-to-have, future)

## Decisions

### D1: ApiProvider placement — in `bootstrap.tsx`, wrapping `<BrowserRouter>`

```
bootstrap.tsx render tree:
  <ApiProvider>           ← NEW (provides QueryClient)
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ApiProvider>
```

**Rationale**: The `QueryClientProvider` must sit above any component that calls `useQuery` / `useMutation`. Placing it in `bootstrap.tsx` (the outermost render boundary) guarantees all MFE remotes loaded inside `<App />` inherit the context. Wrapping *outside* `BrowserRouter` means the query client is available even to router-level loaders if we add them later.

**Alternative considered**: Wrapping inside `App.tsx` around `<ShellLayout>`. Rejected because any component rendered outside `ShellLayout` (e.g., a future top-level error boundary) would lose query access. Per `tanstack-query cache-defaults`, a single `QueryClient` with sensible defaults (`staleTime: 60s`, `gcTime: 300s`, `retry: 1`) is already configured in `@mfe/api`'s `ApiProvider`.

### D2: AuthGuard — a thin wrapper reading Zustand + Navigate

```
AuthGuard component flow:
  ┌──────────────┐
  │ useStore(     │
  │   isAuthentic │
  │   ated)       │
  └──────┬───────┘
         │
    ┌────▼────┐     ┌─────────────────────┐
    │ false?  │─YES─▶ <Navigate to="/auth/ │
    │         │     │  login" replace />   │
    └────┬────┘     └─────────────────────┘
         │ NO
    ┌────▼────┐
    │ render  │
    │ children│
    └─────────┘
```

**Rationale**: Per ADR-003, `isAuthenticated` in the Zustand store is the single source of truth for client-side auth gating. The guard does **not** make an API call — that's the responsibility of a bootstrap auth-hydration step (out of scope). This keeps the guard synchronous and avoids fetch waterfalls (per `vercel-react-best-practices async-cheap-condition-before-await`).

**Alternative considered**: Route-level `loader` functions in React Router v7 that check auth before rendering. Rejected because (a) the current setup uses `<Routes>` declarative API, not data-router `createBrowserRouter`, and (b) a component guard is simpler, more visible, and sufficient for client-side SPA auth gating.

**Where applied**: The guard wraps the route *element*, not the `<Route>` itself, so the URL still matches and the user sees the redirect:

```tsx
<Route path="/account/*" element={
  <AuthGuard>
    <RemoteErrorBoundary><Suspense fallback={…}><AccountApp /></Suspense></RemoteErrorBoundary>
  </AuthGuard>
} />
```

Protected routes: `/account/*`, `/orders/*`. Public routes: `/`, `/products/*`, `/cart`, `/auth/*`.

### D3: `/orders/*` route — maps to AccountMFE

Per ADR-001, orders belong to the account domain. The route definition mirrors the existing `/account/*` pattern:

```tsx
<Route path="/orders/*" element={
  <AuthGuard>
    <RemoteErrorBoundary><Suspense fallback={…}><AccountApp /></Suspense></RemoteErrorBoundary>
  </AuthGuard>
} />
```

The Account MFE will internally differentiate between `/account/*` and `/orders/*` via its own `<Routes>` using relative paths.

### D4: Landing page at `/` — lightweight host-owned page

Instead of `<Navigate to="/products" replace />`, the `/` route renders a `LandingPage` component that lives in `apps/host/src/pages/landing.tsx`. This is a simple static page with hero text and links to `/products` and `/auth/login`. It uses `@mfe/ui` primitives (`Button`, `Card`) and semantic Tailwind tokens (per `tailwind-design-system` and `shadcn` skills).

**Rationale**: A landing page gives the shell a sense of identity and provides a stable entry point. It's host-owned (not an MFE) because it's shell-specific content.

**Alternative considered**: Keep the redirect. Rejected because the user's spec explicitly calls for a landing/dashboard at `/`.

### D5: Auth-aware navbar — conditional rendering based on store state

```
Navbar auth-aware rendering:
  ┌──────────────────────┐
  │ useStore(s => ({     │
  │   isAuthenticated,   │
  │   user               │
  │ }))                  │
  └──────────┬───────────┘
             │
     ┌───────▼───────┐
     │isAuthenticated?│
     └───┬───────┬───┘
      YES│       │NO
   ┌─────▼────┐ ┌▼──────────┐
   │ User icon│ │ "Login"   │
   │ + name   │ │ link to   │
   │ Logout   │ │ /auth/    │
   │ button   │ │ login     │
   └──────────┘ └───────────┘
```

When authenticated: shows user display name (first letter avatar or `User` icon) and a "Logout" button that calls `clearAuth()` from the store. When not authenticated: shows a "Login" link to `/auth/login`.

Per `zustand` skill rules, we read store state via selector (`useStore(s => s.isAuthenticated)`) and call actions (`clearAuth`) directly. Per ADR-002, `user` object comes from the store (set by the auth flow), not from a query.

**Note on logout**: The navbar's "Logout" button calls `clearAuth()` (clears Zustand) **and** should also call the API's `useLogout` mutation to invalidate the server session. Since `useLogout` is a TanStack Query mutation from `@mfe/api`, it needs `QueryClientProvider` — which is guaranteed by D1. The logout mutation (from `@mfe/api`'s `useLogout` hook) handles cookie cleanup and query invalidation.

### D6: File ownership

| File | Owner | Action |
|------|-------|--------|
| `apps/host/src/bootstrap.tsx` | host | MODIFY — wrap with `ApiProvider` |
| `apps/host/src/components/auth-guard.tsx` | host | CREATE |
| `apps/host/src/components/navbar.tsx` | host | MODIFY — auth-aware rendering |
| `apps/host/src/routes/index.tsx` | host | MODIFY — add `/orders/*`, landing, `AuthGuard` |
| `apps/host/src/pages/landing.tsx` | host | CREATE |

No changes to `packages/` — all modifications are in `apps/host`.

## Risks / Trade-offs

- **[Risk] Auth guard is client-side only** → A user can bypass it by disabling JS or manipulating store. **Mitigation**: The backend validates the JWT cookie on every API call (ADR-003). The guard is UX convenience, not a security boundary.

- **[Risk] Zustand `isAuthenticated` defaults to `false` on hard refresh** → User lands on `/account/*` and gets immediately redirected to login even if they have a valid cookie. **Mitigation**: Documented as non-goal. The auth-hydration bootstrap (`/auth/me` on mount) is a separate change that will pre-populate the store before the first render.

- **[Risk] Navbar logout calls `clearAuth()` synchronously but `useLogout` mutation is async** → Brief window where store says "logged out" but cookie still exists. **Mitigation**: Call `clearAuth()` *inside* the mutation's `onSuccess` callback, not before. The UX shows a loading state during logout.

- **[Trade-off] Landing page is minimal** → Could be a richer dashboard with recent orders, featured products, etc. **Accepted**: Keep it simple now; enrich later when MFEs provide data. The exit criterion is "shell renders, nav works."
