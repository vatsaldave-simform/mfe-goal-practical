## Why

Feedback messages (login errors, cart actions, order placement) are currently displayed inline — as text blocks below form fields or inline in page content — creating an inconsistent, visually noisy UX. A unified toast/sonner notification system will replace these scattered messages with a single, consistent feedback surface across all MFEs.

## What Changes

- Mount the `<Toaster>` (already in `packages/ui/src/components/sonner.tsx`) in the host shell so it is available across all MFEs via Module Federation's shared singleton React instance.
- Replace the inline API error block in `LoginPage` (`{error && <div>…</div>}`) with `toast.error(…)`.
- Replace the inline API error block in `RegisterPage` with `toast.error(…)` and add `toast.success("Account created!")` on success.
- Replace the inline error block in `ProfilePage` (failed `/me` fetch) with `toast.error(…)`.
- Add `toast.success("Added to cart")` / `toast.error("Failed to add")` in cart mutation hooks or call sites.
- Add `toast.success("Item removed")` / `toast.error("Failed to remove")` for cart remove mutations.
- Add `toast.success("Order placed!")` / `toast.error("Failed to place order")` in CheckoutPage.
- Add `toast.success("Logged out")` on logout action (host nav / account MFE).
- Export `toast` from `@mfe/ui` barrel so all MFEs import it from a single path (already partially done — verify and complete).

## Capabilities

### New Capabilities

- `toast-provider`: Mount and configure the `<Toaster>` in host shell — single source of truth for the toast renderer across all MFEs.
- `toast-notifications`: Replace inline error/success messages with `toast.*` calls across all relevant pages and mutation hooks.

### Modified Capabilities

- `account-auth-pages`: Login and Register pages remove inline API error banners; success/error feedback moves to toasts.
- `account-profile-page`: Profile page removes inline error display for failed `/me` fetch; moves to toast.
- `storefront-cart-pages`: Cart add/remove operations surface feedback via toasts instead of silent or inline failures.
- `storefront-cart-sync`: Cart mutation hooks gain `onSuccess` / `onError` toast calls where missing.
- `host-shell-layout`: Shell layout mounts `<Toaster>` once.

## Impact

- **packages/ui**: `toast` re-export from `sonner` must be confirmed in barrel (`src/index.ts`).
- **apps/host**: `App.tsx` or shell layout component gains `<Toaster />`.
- **apps/account**: `LoginPage.tsx`, `RegisterPage.tsx`, `ProfilePage.tsx` — remove inline error UI, add toast calls.
- **apps/storefront**: `CheckoutPage.tsx`, cart mutation call-sites — add toast calls.
- **packages/api**: Cart and auth mutation hooks may gain default `onSuccess`/`onError` toast callbacks (or left to call-site — decision in design).
- **No new dependencies**: `sonner` is already installed (Toaster component already exists in `packages/ui`).
- **No breaking changes** to public MFE API or routing.

## Non-goals

- Building a custom notification component (sonner is already wired in `packages/ui`).
- Adding persistent notification history or a notification inbox.
- Migrating `FieldError` components used for *form validation* errors — those stay inline as they are per-field and serve a different UX purpose (accessibility, field proximity).
- Toasting backend 4xx/5xx errors globally via an axios interceptor (out of scope; only specific user-action feedback is toasted).

## Skills

- `shadcn` — for correct usage of the Sonner/Toaster component from `packages/ui`.
- `vercel-react-best-practices` — React component patterns and re-render considerations.
- `tanstack-query-best-practices` — mutation `onSuccess`/`onError` callback patterns.
- `mf` — ensuring `toast` import works correctly across MFE boundaries via shared singletons.
