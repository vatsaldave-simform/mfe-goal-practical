## Why

The storefront MFE (`apps/storefront`) currently has only a placeholder `App.tsx` with no routes, pages, or domain logic. The product-browsing and cart/checkout experience is the core shopping flow—without it the host shell has nothing to render at `/products` or `/cart`. Implementing this now unblocks end-to-end shopping journeys and demonstrates full MFE provider integration (MF exposes, TanStack Query hooks, Zustand cart badge sync).

## What Changes

- **MF provider config** — expose `./App` from storefront so the host can consume it at runtime (mirrors the account MFE pattern).
- **Product pages** — `ProductListPage` (grid with search/filter), `ProductDetailPage` (product info + add-to-cart).
- **Product components** — `ProductCard`, `ProductGrid`, search/filter controls.
- **Cart pages** — `CartPage` (line items, quantity adjustment, remove, order total), `CheckoutPage` (summary + place-order button → `POST /orders`).
- **TanStack Query integration** — wire existing `@mfe/api` hooks (`useProducts`, `useProduct`, `useCart`, `useAddToCart`, `useUpdateCartItem`, `useRemoveCartItem`, `useCreateOrder`) into pages.
- **Cart badge sync** — on cart mutation success, call `store.setCartCount()` so the host nav badge updates in real-time.
- **Standalone dev mode** — storefront runs independently at `:3001` with its own `QueryClientProvider` + `BrowserRouter` for isolated development.

## Non-goals

- **Backend API changes** — products, cart, and orders endpoints already exist and are exercised by `@mfe/api` hooks. No server work needed.
- **Shared package modifications** — `@mfe/api`, `@mfe/store`, `@mfe/shared`, and `@mfe/ui` are already feature-complete for this flow.
- **Payment processing** — checkout simply calls `POST /orders` (already creates an order from the current cart).
- **SSR/streaming** — all rendering is client-side via Rsbuild MF provider.
- **View transitions** — polish-phase concern; not in scope.

## Capabilities

### New Capabilities

- `storefront-mf-provider`: Module Federation provider configuration (exposes `./App`, shared singletons match host).
- `storefront-product-pages`: Product list (grid, search, filter) and product detail page with add-to-cart.
- `storefront-cart-pages`: Cart page (items table, quantities, remove, total) and checkout page (place order flow).
- `storefront-query-wiring`: Integration of existing `@mfe/api` TanStack Query hooks into storefront pages with proper loading/error states.
- `storefront-cart-sync`: Cart mutation `onSuccess` callbacks that update the Zustand cart slice (`setCartCount`) for host badge.
- `storefront-standalone-dev`: Standalone development wrapper (QueryClientProvider, BrowserRouter, nav) for isolated `:3001` development.

### Modified Capabilities

_(none — no existing spec requirements are changing)_

## Impact

- **`apps/storefront/`** — new pages, components, hooks wiring, route config, MF expose, standalone wrapper.
- **`apps/storefront/module-federation.config.ts`** — adds `exposes: { "./App": "./src/App.tsx" }` + `@mfe/store`, `@mfe/api` singletons.
- **`apps/host/`** — already configured with `storefront` remote; will render storefront routes once exposed component exists. No host code changes required.
- **Dependencies** — `@tanstack/react-query` added to storefront devDependencies (already in `@mfe/api` but needed for `QueryClientProvider` in standalone mode).
- **No breaking changes.**

## Skills

- `mf` — MF provider config, shared singletons, expose pattern.
- `tanstack-query-best-practices` — query hook wiring, loading/error states, mutation invalidation.
- `zustand` — cart badge sync via store actions.
- `shadcn` — UI components from `@mfe/ui` (Button, Card, Input, Badge, etc.).
- `tailwind-design-system` — layout, responsive grid, semantic tokens.
- `vercel-react-best-practices` — component composition, lazy loading, performance.
- `rsbuild-best-practices` — Rsbuild dev/build config.
- `turborepo` — workspace dependency wiring.
