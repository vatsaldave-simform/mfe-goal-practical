## Why

The `@mfe/store` package is currently an empty scaffold (`export {}`). Per ADR-002 and ADR-005, it must provide shared Zustand state for auth and cart — the only two pieces of genuinely global UI state shared across MFE boundaries via Module Federation singleton. Without it, MFEs have no way to coordinate "is the user logged in?" or "how many items are in the cart badge?" across host, storefront, and account.

## What Changes

- Add `zustand` as a dependency of `@mfe/store`
- Create **auth slice** with `isAuthenticated`, `user` (SafeUser | null), `setAuth()`, and `clearAuth()` actions
- Create **cart slice** with `itemCount`, `setCartCount()`, and `clearCart()` actions
- Create combined store types (`StoreState`) and the `useStore` hook export
- Wire barrel export in `src/index.ts` so all MFEs can consume via `import { useStore } from '@mfe/store'`

## Non-goals

- **No server-fetched data in the store** — product lists, full cart contents, and order history belong in TanStack Query (ADR-002)
- **No JWT token storage** — token lives in httpOnly cookie (ADR-003)
- **No form state** — React Hook Form manages that locally (ADR-008)
- **No optimistic cart item manipulation** — `addItem`/`removeItem` are TanStack Query mutations in `@mfe/api`; the store only holds `itemCount` for the badge
- **No MF config changes** — `@mfe/store` is already declared as a shared singleton in all frontend apps' `module-federation.config.ts`
- **No app-level integration code** — MFE consumption of the store (syncing after login/cart mutations) is a separate change

## Capabilities

### New Capabilities

- `store-auth-slice`: Auth state slice — `isAuthenticated`, `user`, `setAuth()`, `clearAuth()` for cross-MFE auth awareness
- `store-cart-slice`: Cart state slice — `itemCount`, `setCartCount()`, `clearCart()` for cross-MFE cart badge display
- `store-combined`: Combined store creation, type exports, and `useStore` hook

### Modified Capabilities

_(none — no existing spec-level requirements change)_

## Impact

- **`packages/store/`** — All changes scoped here (~4 new files, 1 updated `package.json`)
- **Dependencies** — Adds `zustand` (runtime) to `@mfe/store`; imports `SafeUser` from `@mfe/shared` (already a dependency)
- **Consumers** — All three frontend apps (`host`, `storefront`, `account`) already declare `@mfe/store` as a workspace dependency and `zustand` as an MF shared singleton. No consumer-side changes required for this change — apps will import from `@mfe/store` in future integration changes.
- **Build pipeline** — No turbo.json changes needed; `@mfe/store` already participates in the `^build` graph

## Skills

- **zustand** — Slice conventions, action naming, store composition
- **typescript-advanced-types** — Store type definitions, slice typing
