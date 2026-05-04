## 1. Mount ApiProvider at Root

- [x] 1.1 Wrap the app tree with `ApiProvider` in `apps/host/src/bootstrap.tsx` — import `ApiProvider` from `@mfe/api` and place it outside `<BrowserRouter>` so all components (including MFE remotes) inherit the shared `QueryClient`. **Target**: `apps/host`. **Skills to load**: `tanstack-query-best-practices`, `mf` (shared-deps).

## 2. Create AuthGuard Component

- [x] 2.1 Create `apps/host/src/components/auth-guard.tsx` — a component that reads `isAuthenticated` from `@mfe/store` via `useStore(s => s.isAuthenticated)` and either renders `children` or returns `<Navigate to="/auth/login" replace />`. No API calls. **Target**: `apps/host`. **Skills to load**: `zustand`, `vercel-react-best-practices`.

## 3. Create Landing Page

- [x] 3.1 Create `apps/host/src/pages/landing.tsx` — a simple hero page with store name/tagline, a "Browse Products" `Button` linking to `/products`, and a "Sign In" `Button` linking to `/auth/login`. Use `@mfe/ui` primitives and semantic Tailwind tokens only. **Target**: `apps/host`. **Skills to load**: `shadcn`, `tailwind-design-system`.

## 4. Update Route Configuration

- [x] 4.1 Update `apps/host/src/routes/index.tsx` — replace the `/` `<Navigate>` redirect with the `LandingPage` component. **Target**: `apps/host`. **Skills to load**: `vercel-react-best-practices`.
- [x] 4.2 Add `/orders/*` route in `apps/host/src/routes/index.tsx` — maps to `lazy(AccountApp)`, wrapped in `AuthGuard` + `RemoteErrorBoundary` + `Suspense`. **Target**: `apps/host`.
- [x] 4.3 Wrap `/account/*` route element in `AuthGuard` in `apps/host/src/routes/index.tsx`. **Target**: `apps/host`.

## 5. Update Navbar to Be Auth-Aware

- [x] 5.1 Update `apps/host/src/components/navbar.tsx` — read `isAuthenticated` and `user` from store. When not authenticated: show "Login" link to `/auth/login`. When authenticated: show user display name and a "Logout" button. **Target**: `apps/host`. **Skills to load**: `zustand`, `shadcn`, `vercel-react-best-practices`.
- [x] 5.2 Add conditional "Orders" nav link in `apps/host/src/components/navbar.tsx` — only visible when `isAuthenticated` is `true`, linking to `/orders`. **Target**: `apps/host`.
- [x] 5.3 Implement logout action in navbar — call `useLogout` mutation from `@mfe/api`, on success call `clearAuth()` from store and navigate to `/auth/login`. **Target**: `apps/host`. **Skills to load**: `tanstack-query-best-practices`, `zustand`.

## 6. Verify & Smoke Test

- [x] 6.1 Run `pnpm turbo run typecheck --filter=@mfe/host` and fix any TypeScript errors. **Target**: `apps/host`.
- [x] 6.2 Run `pnpm turbo dev` and verify: shell renders at `localhost:3000`, navbar shows, `/` shows landing page, navigation links work, auth guard redirects `/account` and `/orders` to `/auth/login`, and MF remotes show error boundary fallback (since remotes don't expose yet). **Target**: all apps.
