## Context

The storefront MFE (`apps/storefront`) is scaffolded with Rsbuild + Module Federation but has only a placeholder `App.tsx`. The host already declares `storefront` as a remote pointing at `http://localhost:3001/mf-manifest.json`. All supporting infrastructure exists:

- `@mfe/api` — query hooks: `useProducts`, `useProduct`, `useCart`, `useAddToCart`, `useUpdateCartItem`, `useRemoveCartItem`, `useCreateOrder`
- `@mfe/store` — Zustand slices: `setCartCount`, `clearCart`, `itemCount`
- `@mfe/shared` — types (`Product`, `CartItem`, `CartResponse`, `ProductListResponse`), constants (`ROUTES`, `DEFAULT_PAGE_SIZE`), utils (`formatCurrency`)
- `@mfe/ui` — shadcn components (Button, Card, Input, Badge, Separator, etc.)
- Backend — products, cart, orders endpoints all operational

The account MFE is the reference pattern — it exposes `./App` with relative `<Routes>` and shares singletons.

## Goals / Non-Goals

**Goals:**
- Product browsing (list with search/filter, detail page with add-to-cart)
- Cart management (view items, adjust quantities, remove, see total)
- Checkout (place order → creates order from current cart, redirects to confirmation)
- MF provider integration (host can load storefront at runtime)
- Cart badge sync (mutations update Zustand `itemCount` for host nav)
- Standalone dev (run `:3001` in isolation with full functionality)

**Non-Goals:**
- New backend endpoints (all exist)
- New shared package exports (existing hooks/types suffice)
- Payment gateway integration
- Inventory validation beyond stock display
- SSR / streaming
- View transitions (polish phase)

## Decisions

### D1: Route structure — flat relative routes

```
<Routes>
  <Route index element={<ProductListPage />} />
  <Route path=":id" element={<ProductDetailPage />} />
  <Route path="cart" element={<CartPage />} />
  <Route path="checkout" element={<CheckoutPage />} />
</Routes>
```

**Rationale**: Per ADR-004, MFEs use relative `<Routes>`. The host mounts storefront under `/products/*` (or similar), so all paths are relative. Matches account MFE pattern exactly.

**Alternative considered**: Nested route with layout wrapper — rejected because there's no shared sub-layout unique to storefront; host's shell layout covers it.

### D2: MF shared singletons — mirror account config

```typescript
// module-federation.config.ts
exposes: { "./App": "./src/App.tsx" },
shared: {
  react: { singleton: true, requiredVersion: "^19.0.0" },
  "react-dom": { singleton: true, requiredVersion: "^19.0.0" },
  "react-router": { singleton: true, requiredVersion: "^7.0.0" },
  zustand: { singleton: true, requiredVersion: "^5.0.0" },
  "@mfe/store": { singleton: true, requiredVersion: "workspace:*" },
  "@mfe/api": { singleton: true, requiredVersion: "workspace:*" },
}
```

**Rationale**: Per ADR-005 and `mf shared-deps` skill — ensures single React instance, single router, single store, single query client across host + storefront + account.

### D3: Cart badge sync — mutation `onSuccess` wrapper

```
┌─────────────────┐      onSuccess       ┌──────────────┐
│  useAddToCart()  │ ──────────────────▶  │ store.set    │
│  useRemoveCart() │                      │ CartCount(n) │
│  usePlaceOrder() │                      └──────┬───────┘
└─────────────────┘                              │
                                                 ▼
                                    ┌────────────────────┐
                                    │  Host nav <Badge>  │
                                    │  reads itemCount   │
                                    └────────────────────┘
```

Storefront pages wrap the `@mfe/api` mutation hooks with local helpers that call `useStore().setCartCount(response.itemCount)` in their component-level `onSuccess`. This avoids modifying `@mfe/api` (which must remain backend-agnostic) and keeps the syncing concern in the MFE (per ADR-009: "share as little state as possible").

**Alternative considered**: Injecting store calls directly into `@mfe/api` mutation hooks — rejected because `@mfe/api` shouldn't depend on `@mfe/store` internals. The API layer knows about cache invalidation, not store syncing.

### D4: Component ownership — domain components in MFE

Per ADR-007: "MFE-specific components stay in the MFE; only shared/reusable components in packages/ui."

| Component | Location | Reason |
|-----------|----------|--------|
| `ProductCard` | `apps/storefront/src/components/` | Product-domain specific |
| `ProductGrid` | `apps/storefront/src/components/` | Layout for product cards |
| `SearchFilter` | `apps/storefront/src/components/` | Product search/filter UI |
| `CartItemRow` | `apps/storefront/src/components/` | Cart-domain specific |
| `OrderSummary` | `apps/storefront/src/components/` | Checkout display |
| Button, Card, Input, Badge | `@mfe/ui` | Already exists as shared |

### D5: Standalone dev wrapper — conditional providers

```
┌──────────────────────────────────┐
│ index.tsx (entry point)          │
│  └── bootstrap.tsx               │
│       └── StandaloneWrapper      │  ← only in standalone
│            ├── QueryClientProvider│
│            ├── BrowserRouter     │
│            └── <App />           │
└──────────────────────────────────┘
```

In standalone mode, `bootstrap.tsx` wraps `<App>` with `QueryClientProvider` and `BrowserRouter`. When consumed via MF, the host provides these — the MFE's `App` component is a pure route fragment.

**Rationale**: Mirrors account MFE. Per `rsbuild-best-practices`, `index.tsx` → `bootstrap.tsx` split enables async Module Federation initialization.

### D6: Search and filter — local URL state via searchParams

Product list search/filter state lives in URL search params (`?search=...&category=...&page=...`), read via `useSearchParams()`. This makes filters bookmarkable and prevents TanStack Query from refetching on every keystroke (per `tanstack-query pf-stale-time-config`).

Debounce search input to 300ms before updating params → triggering query.

### D7: Data flow — no fetch waterfalls

```
ProductListPage mount
  └── useProducts(filters)     ← single query, includes pagination
  
ProductDetailPage mount  
  └── useProduct(id)           ← single query
  
CartPage mount
  └── useCart()                ← single query (items + total in one response)
  
CheckoutPage mount
  └── useCart()                ← same query (cache hit from CartPage)
  └── useCreateOrder()         ← mutation on submit
```

Per `vercel-react-best-practices`: no sequential dependent fetches. Each page issues a single primary query. Cart data on CheckoutPage comes from cache (per `tanstack-query cache-stale-time`).

## Risks / Trade-offs

- **[Risk] QueryClient instance in standalone vs host** → Mitigation: Conditional wrapper ensures Provider is only mounted in standalone. When loaded via MF, host's `QueryClientProvider` is inherited via the shared singleton (per ADR-005).

- **[Risk] Race condition on cart badge sync** → Mitigation: `onSuccess` fires after cache invalidation, so `response.itemCount` from the mutation response is the source of truth. No stale reads.

- **[Risk] Large product list on initial load** → Mitigation: Paginated API (`DEFAULT_PAGE_SIZE = 12`), loading skeleton on first render. Products have `staleTime: 60_000` since catalog changes infrequently.

- **[Trade-off] Debounced search instead of instant** → Acceptable because it prevents excessive API calls. 300ms is imperceptible for typed search.

- **[Trade-off] No optimistic updates for cart mutations** → Initial implementation uses simple invalidation. Optimistic updates can be added later if latency is noticeable. Keeps first pass simpler.
