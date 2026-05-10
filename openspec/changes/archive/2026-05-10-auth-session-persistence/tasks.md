## 1. Audit 401 Interceptor

- [x] 1.1 Open `packages/api/src/client.ts` and read the axios 401 interceptor — check whether it unconditionally redirects to `/auth/login` on every 401, or if it already skips certain routes
- [x] 1.2 If the interceptor redirects on all 401s, add a bypass: skip the redirect when the request URL matches `ROUTES.AUTH.ME` (e.g., `config.url === ROUTES.AUTH.ME`) so that the startup session check can return an error state without triggering a navigation loop

## 2. Create AuthInitializer Component

- [x] 2.1 Create `apps/host/src/components/auth-initializer.tsx` — call `useMe` with `retry: false` and `staleTime: 5 * 60 * 1000`; use `useEffect` to call `setAuth(data.user)` on success and `clearAuth()` on error; render `null` while `isPending`, render `children` once settled
- [x] 2.2 Verify the component correctly blocks children during the pending state and renders them after both success and error branches settle

## 3. Wire AuthInitializer into bootstrap.tsx

- [x] 3.1 In `apps/host/src/bootstrap.tsx`, wrap `<App />` with `<AuthInitializer>` — it must be inside `<ApiProvider>` and `<BrowserRouter>` (needs query client and router context)
- [x] 3.2 Verify that navigating to a protected route directly (e.g., `/account`) while holding a valid cookie no longer redirects to login on refresh

## 4. Add GuestGuard to Auth Routes

- [x] 4.1 In `apps/host/src/routes/index.tsx`, wrap the `/auth/*` `<Route>` element with an inline guard (or small `GuestGuard` component) that reads `isAuthenticated` from the store and returns `<Navigate to="/account" replace />` when `true`, otherwise renders the `<AccountApp />`
- [x] 4.2 Manually verify: logged-in user navigating to `/auth/login` or `/auth/register` is redirected to `/account`; unauthenticated user can access both pages normally

## 5. Update LandingPage to Be Auth-Aware

- [x] 5.1 In `apps/host/src/pages/landing.tsx`, read `isAuthenticated` from `useStore`; when `true`, replace the "Sign In" button with a "My Account" button linking to `/account`; keep the "Browse Products" button unconditional
- [x] 5.2 Verify: after refresh with a valid cookie, the landing page (once `AuthInitializer` resolves) shows "My Account" instead of "Sign In"
