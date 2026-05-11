## Why

The host app mounts the entire Account MFE under `/auth/*`, making guest-only routes (login, register) and authenticated routes (profile) all accessible via the same base path — e.g., `/auth/profile` resolves when it should be unreachable. Additionally, the shell layout's `<main>` has no max-width constraint, causing skeletons and page content to stretch edge-to-edge on wide screens, producing a broken UX inconsistent with the centered form pages.

## What Changes

- **Split Account MFE exposure**: expose a dedicated `./AuthApp` (login + register) alongside the existing `./App` (profile, orders) so the host can mount each under the correct base path with the correct guard.
- **Fix host route partitioning**: `/auth/*` → `AuthApp` (GuestGuard only), `/account/*` → `AccountApp` (AuthGuard, profile), `/orders/*` → `AccountApp` (AuthGuard, orders).
- **Add `PageContainer` component**: a centered, max-width-constrained wrapper in `packages/ui` consumed by `ShellLayout` so all pages — including skeleton fallbacks — fit within a consistent layout boundary.
- Storefront routes remain unchanged (products/cart separation is correct by path prefix).

## Capabilities

### New Capabilities

- `page-container`: A shared `PageContainer` component (in `packages/ui`) that wraps all page-level content in a centered, max-width-bounded layout column, used inside `ShellLayout`.

### Modified Capabilities

- `account-mf-provider`: Adds a second exposed entry (`./AuthApp`) that exports only the login and register routes, keeping profile/orders in `./App`.
- `host-mf-consumer`: Updates host route definitions to consume `account/AuthApp` for `/auth/*` (GuestGuard) and `account/App` for `/account/*` and `/orders/*` (AuthGuard), and wraps all page slots with `PageContainer`.
- `host-shell-layout`: `ShellLayout`'s `<main>` gets a `PageContainer` inner wrapper so skeleton fallbacks and all page content respect the common max-width boundary.

## Impact

- `apps/account/src/`: new `AuthApp.tsx` file, `App.tsx` scoped to profile + orders routes.
- `apps/account/module-federation.config.ts`: adds `"./AuthApp": "./src/AuthApp.tsx"`.
- `apps/host/src/routes/index.tsx`: imports `account/AuthApp` for `/auth/*`, keeps `account/App` for `/account/*` and `/orders/*`.
- `apps/host/src/components/shell-layout.tsx`: wraps children in `PageContainer`.
- `packages/ui/src/components/page-container.tsx`: new component.
- `packages/ui/src/index.ts`: exports `PageContainer`.
- No API, store, or backend changes.
- No breaking changes to storefront MFE.

## Non-goals

- Splitting the storefront MFE (products vs cart) — storefront routing is correct already.
- Adding per-page layout overrides or full-bleed sections — `PageContainer` is one global boundary.
- Changing authentication strategy (ADR-003 unchanged).
- Animating route transitions (out of scope, see `vercel-react-view-transitions` skill).

## Skills

- `mf` — modifying `module-federation.config.ts` (adding `./AuthApp` expose) and host remote imports (`account/AuthApp`).
- `shadcn` + `tailwind-design-system` — building `PageContainer` component in `packages/ui` with Tailwind v4 tokens.
- `vercel-react-best-practices` — lazy loading the new remote, Suspense boundary placement.
- `vercel-composition-patterns` — `PageContainer` as a composition wrapper rather than a boolean prop on `ShellLayout`.
