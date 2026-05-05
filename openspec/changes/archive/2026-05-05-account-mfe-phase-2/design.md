## Context

Phase 1 of the account MFE delivered login, register, and profile pages. The host shell already routes `/orders/*` to the `AccountApp` remote behind `AuthGuard`. The full orders backend (Prisma-backed REST endpoints), shared types (`OrderSummary`, `OrderDetail`, `OrderItem` in `@mfe/shared`), TanStack Query hooks (`useOrders`, `useOrder`, `useCreateOrder` in `@mfe/api`), and query key factories (`orderKeys` in `@mfe/api`) are all implemented and exported. The only missing piece is the account MFE's UI layer to consume them.

```
┌──────────────────────────────────────────────────────┐
│  Host (port 3000)                                    │
│  /orders/* → AuthGuard → <AccountApp />  (exists)    │
└─────────────────┬────────────────────────────────────┘
                  │ MF runtime load
┌─────────────────▼────────────────────────────────────┐
│  Account MFE (port 3002)                             │
│  <Routes>                                            │
│    orders       → OrdersPage      ← NEW             │
│    orders/:id   → OrderDetailPage ← NEW             │
│    login        → LoginPage       (exists)           │
│    register     → RegisterPage    (exists)           │
│    profile      → ProfilePage     (exists)           │
│  </Routes>                                           │
└─────────────────┬────────────────────────────────────┘
                  │ imports from @mfe/api
┌─────────────────▼────────────────────────────────────┐
│  @mfe/api                                            │
│  useOrders()  → GET /api/orders      (exists)        │
│  useOrder(id) → GET /api/orders/:id  (exists)        │
└─────────────────┬────────────────────────────────────┘
                  │ axios → httpOnly cookie
┌─────────────────▼────────────────────────────────────┐
│  Backend (port 3003)                                 │
│  GET  /api/orders     → list (exists)                │
│  GET  /api/orders/:id → detail (exists)              │
│  POST /api/orders     → create (exists)              │
└──────────────────────────────────────────────────────┘
```

## Goals / Non-Goals

**Goals:**
- Render an order history list in `OrdersPage` using `useOrders()` with proper loading, empty, and error states.
- Render full order details (line items, prices, totals) in `OrderDetailPage` using `useOrder(id)`.
- Wire routes into the account MFE `App.tsx` so orders are accessible both standalone (`localhost:3002/account/orders`) and federated (`localhost:3000/orders`).
- Use `@mfe/ui` components (Card, Badge, Table, Skeleton, Button) and semantic design tokens — no raw Tailwind colors.

**Non-Goals:**
- "Place order" / checkout flow (belongs to storefront MFE's cart page).
- Order status management, cancellation, or admin surfaces.
- Pagination, infinite scroll, or filtering on the orders list.
- New shared components in `packages/ui` (use what's already available).
- Any backend or `@mfe/api` changes.

## Decisions

### D1: Pages live in `apps/account/src/pages/`, no local hooks directory

The account MFE already imports all query hooks from `@mfe/api` (per ADR-006). No local `hooks/` directory is needed — `useOrders` and `useOrder` are already exported from `@mfe/api`. This keeps the account MFE thin: pages only, no duplicated data-fetching logic.

**Alternative considered:** Local wrapper hooks for `useOrders` with MFE-specific defaults (e.g., `enabled: isAuthenticated`). Rejected because `AuthGuard` in the host already prevents unauthenticated access, and standalone mode has its own auth check. Adding wrappers would be indirection without value.

### D2: Order list rendered with Card components, not a data table

Orders list uses `Card` components (one per order) rather than a `<Table>`. Rationale:
- Order summaries have few fields (status, total, date, item count) — a table is overkill.
- Cards are mobile-friendly out of the box.
- Consistent with the profile page's card-based layout.
- Per shadcn skill: use semantic colors (`bg-primary`, `text-muted-foreground`) and `cn()` for conditional styling.

**Alternative considered:** shadcn `DataTable` with sorting/filtering. Rejected as a non-goal; can be added later if the orders list grows.

### D3: Order detail rendered as a header card + items table

Order detail page uses:
- A Card header showing order ID, status (Badge), date, total.
- A simple Table for line items (name, qty, unit price, line total).

This separates order metadata from line-item data, making the page scannable. Price formatting uses `formatCurrency` from `@mfe/shared` (per existing convention).

### D4: Route structure uses relative paths within `<Routes>`

Per ADR-004, the account MFE's `App.tsx` uses relative `<Route path="...">` inside a `<Routes>` block. The host mounts the component at `/orders/*`, so:
- `path="orders"` in account MFE maps to `/orders` in the host.
- `path="orders/:id"` maps to `/orders/:id` in the host.
- Standalone mode uses `basename="/account"` (existing `bootstrap.tsx`), so full standalone paths are `/account/orders` and `/account/orders/:id`.

### D5: Loading states use Skeleton components (per vercel-react-best-practices)

Both pages render Skeleton placeholders during data loading instead of a spinner. This avoids layout shift and provides better perceived performance. Error states show a simple error card with a retry button. Empty state on orders list shows a message guiding the user to browse products.

### D6: Navigation between orders list and detail via react-router `useNavigate`

`OrdersPage` links each order card to `orders/:id` (relative). `OrderDetailPage` has a back button navigating to `orders` (relative). Both use `<Link>` from react-router for declarative navigation, which is the preferred pattern over imperative `navigate()`.

## Risks / Trade-offs

- **[Risk] Standalone mode may not have auth context** → Mitigation: Standalone `bootstrap.tsx` already wraps `<App />` in `<ApiProvider>`, and the `apiClient` 401 interceptor redirects to `/login`. In federated mode, `AuthGuard` prevents unauthenticated access. No additional guard needed in the MFE itself.
- **[Risk] No pagination could be slow with many orders** → Mitigation: Accepted for MVP. The backend returns all orders sorted by date. For a learning project with seeded data, this is fine. Pagination is listed as a non-goal and can be added later.
- **[Trade-off] No optimistic UI for order list** → The orders list is read-only in this change. `useCreateOrder` is called from the storefront, and query invalidation (already implemented in `@mfe/api`) ensures the list refreshes. No optimistic update needed here.
