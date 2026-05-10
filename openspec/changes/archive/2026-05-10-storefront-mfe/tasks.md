## 1. Module Federation Provider Setup

- [x] 1.1 Update `apps/storefront/module-federation.config.ts` — add `exposes: { "./App": "./src/App.tsx" }` and add `@mfe/store`, `@mfe/api` singletons to shared config (mirror account MFE pattern)
  - **Target**: `apps/storefront`
  - **Skills to load**: `mf` (shared-deps sub-skill)

- [x] 1.2 Add `@tanstack/react-query` to `apps/storefront/package.json` dependencies (needed for standalone `QueryClientProvider`)
  - **Target**: `apps/storefront`
  - **Skills to load**: `turborepo`

## 2. Entry Point & Standalone Dev Wrapper

- [x] 2.1 Update `apps/storefront/src/index.tsx` to use async dynamic import of `bootstrap.tsx` (MF async initialization pattern)
  - **Target**: `apps/storefront/src/index.tsx`
  - **Skills to load**: `mf`, `rsbuild-best-practices`

- [x] 2.2 Create `apps/storefront/src/bootstrap.tsx` with standalone wrapper: `QueryClientProvider` + `BrowserRouter` + dev navigation + `<App />`
  - **Target**: `apps/storefront/src/bootstrap.tsx`
  - **Skills to load**: `tanstack-query-best-practices`, `mf`

## 3. App Route Structure

- [x] 3.1 Rewrite `apps/storefront/src/App.tsx` as a pure route fragment with `<Routes>`: index → `ProductListPage`, `:id` → `ProductDetailPage`, `cart` → `CartPage`, `checkout` → `CheckoutPage`
  - **Target**: `apps/storefront/src/App.tsx`
  - **Skills to load**: `vercel-react-best-practices`

- [x] 3.2 Create `apps/storefront/src/pages/index.ts` barrel export for all page components
  - **Target**: `apps/storefront/src/pages/`
  - **Skills to load**: (none)

## 4. Product Components

- [x] 4.1 Create `apps/storefront/src/components/ProductCard.tsx` — displays product image, name, price (formatted), category badge; links to detail route
  - **Target**: `apps/storefront/src/components/`
  - **Skills to load**: `shadcn`, `tailwind-design-system`, `vercel-composition-patterns`

- [x] 4.2 Create `apps/storefront/src/components/ProductGrid.tsx` — responsive grid layout that renders a list of `ProductCard` components
  - **Target**: `apps/storefront/src/components/`
  - **Skills to load**: `tailwind-design-system`

- [x] 4.3 Create `apps/storefront/src/components/SearchFilter.tsx` — search input (debounced 300ms) + category dropdown filter; updates URL search params
  - **Target**: `apps/storefront/src/components/`
  - **Skills to load**: `shadcn`, `vercel-react-best-practices`

- [x] 4.4 Create `apps/storefront/src/components/ProductSkeleton.tsx` — loading skeleton matching ProductCard/Grid layout
  - **Target**: `apps/storefront/src/components/`
  - **Skills to load**: `shadcn`

## 5. Product Pages

- [x] 5.1 Create `apps/storefront/src/pages/ProductListPage.tsx` — uses `useProducts(filters)` with URL search params, renders `SearchFilter` + `ProductGrid` + pagination controls + loading/empty/error states
  - **Target**: `apps/storefront/src/pages/`
  - **Skills to load**: `tanstack-query-best-practices`, `vercel-react-best-practices`

- [x] 5.2 Create `apps/storefront/src/pages/ProductDetailPage.tsx` — uses `useProduct(id)` from route param, renders product info + "Add to Cart" button with loading/error states; calls `useAddToCart` with cart badge sync
  - **Target**: `apps/storefront/src/pages/`
  - **Skills to load**: `tanstack-query-best-practices`, `shadcn`, `zustand`

## 6. Cart Components

- [x] 6.1 Create `apps/storefront/src/components/CartItemRow.tsx` — displays product image, name, price, quantity controls (+/−), remove button, line total
  - **Target**: `apps/storefront/src/components/`
  - **Skills to load**: `shadcn`, `vercel-composition-patterns`

- [x] 6.2 Create `apps/storefront/src/components/OrderSummary.tsx` — displays cart items summary, total, and action button (used in checkout)
  - **Target**: `apps/storefront/src/components/`
  - **Skills to load**: `shadcn`, `tailwind-design-system`

## 7. Cart & Checkout Pages

- [x] 7.1 Create `apps/storefront/src/pages/CartPage.tsx` — uses `useCart()`, renders `CartItemRow` list, total, empty state, "Proceed to Checkout" button; wires `useUpdateCartItem` and `useRemoveCartItem` with cart badge sync
  - **Target**: `apps/storefront/src/pages/`
  - **Skills to load**: `tanstack-query-best-practices`, `zustand`

- [x] 7.2 Create `apps/storefront/src/pages/CheckoutPage.tsx` — uses `useCart()` (cache hit), renders `OrderSummary`, "Place Order" button wiring `useCreateOrder` with loading/error states + cart badge sync; navigates to confirmation on success
  - **Target**: `apps/storefront/src/pages/`
  - **Skills to load**: `tanstack-query-best-practices`, `zustand`

## 8. Cart Badge Sync Hook

- [x] 8.1 Create `apps/storefront/src/hooks/useCartSync.ts` — a thin wrapper/utility that calls `useStore.getState().setCartCount(itemCount)` from mutation response data; used by all cart-mutating pages
  - **Target**: `apps/storefront/src/hooks/`
  - **Skills to load**: `zustand`, `tanstack-query-best-practices`

## 9. Tailwind & CSS Setup

- [x] 9.1 Update `apps/storefront/src/app.css` — import Tailwind (`@import "tailwindcss"`) and reference `@mfe/ui` design tokens (same pattern as account MFE)
  - **Target**: `apps/storefront/src/app.css`
  - **Skills to load**: `tailwind-design-system`

## 10. Verification

- [x] 10.1 Run `pnpm --filter @mfe/storefront typecheck` — ensure no TypeScript errors
  - **Target**: `apps/storefront`
  - **Skills to load**: (none)

- [x] 10.2 Run `pnpm --filter @mfe/storefront dev` — verify standalone mode starts on port 3001, all routes render, products load from backend
  - **Target**: `apps/storefront`
  - **Skills to load**: (none)

- [x] 10.3 Run full `turbo run dev` — verify host at `:3000` loads storefront MFE, products browse, add to cart works, checkout creates order, badge syncs
  - **Target**: root (all apps)
  - **Skills to load**: `turborepo`
