## 1. Account MFE — Split Route Entry Points

- [x] 1.1 Create `apps/account/src/AuthApp.tsx` exporting a `<Routes>` with only `login` and `register` relative routes
- [x] 1.2 Create `apps/account/src/OrdersApp.tsx` exporting a `<Routes>` with an index route (OrdersPage) and `:id` route (OrderDetailPage)
- [x] 1.3 Scope `apps/account/src/App.tsx` to export a `<Routes>` with only the `profile` relative route
- [x] 1.4 Update `apps/account/module-federation.config.ts` to add `"./AuthApp": "./src/AuthApp.tsx"` and `"./OrdersApp": "./src/OrdersApp.tsx"` under `exposes`

## 2. Host App — Fix Route Partitioning

- [x] 2.1 In `apps/host/src/routes/index.tsx`, add `lazy(() => import("account/AuthApp"))` as `AccountAuthApp` and `lazy(() => import("account/OrdersApp"))` as `AccountOrdersApp`
- [x] 2.2 Replace the `/auth/*` route element to use `AccountAuthApp` (wrapped in `GuestGuard` + `RemoteErrorBoundary` + `Suspense`)
- [x] 2.3 Confirm the `/account/*` route uses the existing `AccountApp` (`account/App`) wrapped in `AuthGuard`
- [x] 2.4 Replace the `/orders/*` route element to use `AccountOrdersApp` wrapped in `AuthGuard` + `RemoteErrorBoundary` + `Suspense`
- [x] 2.5 Add TypeScript declaration for `"account/AuthApp"` and `"account/OrdersApp"` module types if needed (check `@mf-types/account` generated types)

## 3. PageContainer Component

- [x] 3.1 Create `packages/ui/src/components/page-container.tsx` — a `div` with `mx-auto w-full max-w-6xl px-4` accepting `children` and optional `className`
- [x] 3.2 Export `PageContainer` from `packages/ui/src/index.ts`

## 4. Shell Layout — Apply PageContainer

- [x] 4.1 Import `PageContainer` from `@mfe/ui` in `apps/host/src/components/shell-layout.tsx`
- [x] 4.2 Wrap `{children}` in `<PageContainer>` inside the `<main>` element

## 5. Verification

- [x] 5.1 Start all dev servers (`pnpm dev` from root) and verify `/auth/login` and `/auth/register` load correctly
- [x] 5.2 Verify `/auth/profile` returns no matching route (blank / 404)
- [x] 5.3 Verify `/account/profile` loads the Profile page for authenticated users
- [x] 5.4 Verify `/orders` loads the Orders list for authenticated users
- [x] 5.5 Verify `/orders/:id` loads the Order Detail page for authenticated users
- [x] 5.6 Verify skeleton fallbacks and all pages are max-width bounded — no edge-to-edge content on wide viewports
- [x] 5.7 Verify unauthenticated access to `/account/*` and `/orders/*` redirects to `/auth/login`
