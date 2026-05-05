## Why

Phase 1 delivered the account MFE's auth surfaces (login, register, profile) and wired them into the host shell via Module Federation. The backend orders API (`GET /api/orders`, `GET /api/orders/:id`, `POST /api/orders`), shared types (`OrderSummary`, `OrderDetail`, `OrderItem`), and TanStack Query hooks (`useOrders`, `useOrder`, `useCreateOrder`) are already implemented in their respective packages. However, the account MFE has no UI to consume them — users cannot view their order history. Phase 2 closes this gap so the account MFE is fully feature-complete for the MVP.

## What Changes

- Add an **Orders list page** (`OrdersPage`) in `apps/account/src/pages/` that calls `useOrders()` and renders a table/card list of past orders with status, total, date, and item count.
- Add an **Order detail page** (`OrderDetailPage`) that calls `useOrder(id)` and renders the full order with line items, prices, quantities, and computed totals.
- Register `orders` and `orders/:id` routes in the account MFE's `App.tsx` `<Routes>`.
- Update the pages barrel export (`pages/index.ts`) to include the new pages.
- Verify the account MFE works **standalone** (at `localhost:3002/account/orders`) and **federated** (at `localhost:3000/orders` via the host's existing `/orders/*` route).

## Capabilities

### New Capabilities
- `account-orders-ui`: Orders list page and order detail page in the account MFE, consuming existing `useOrders` / `useOrder` hooks from `@mfe/api`.

### Modified Capabilities
_(none — backend, API hooks, types, host routing are already in place)_

## Impact

- **apps/account**: New files in `src/pages/` (`OrdersPage.tsx`, `OrderDetailPage.tsx`), route additions in `App.tsx`, barrel export update in `pages/index.ts`.
- **packages/api**: No changes — `useOrders`, `useOrder`, `useCreateOrder` already exported.
- **packages/shared**: No changes — `OrderSummary`, `OrderDetail`, `OrderItem` types exist.
- **apps/host**: No changes — `/orders/*` route already points to `AccountApp` behind `AuthGuard`.
- **apps/backend**: No changes — orders endpoints fully implemented.
- **Dependencies**: No new dependencies; account MFE already depends on `@mfe/api`, `@mfe/shared`, `@mfe/ui`.

## Non-goals

- Checkout / "place order" flow (that belongs to the storefront MFE's cart page; `useCreateOrder` is consumed there, not here).
- Order status management or admin views.
- Pagination or infinite scroll for orders list (can be added later if order volume warrants it).
- Order filtering or search.

## Skills

- **tanstack-query-best-practices** — consuming `useOrders` / `useOrder` hooks, loading/error states.
- **shadcn** — UI components (Table, Card, Badge, Skeleton) from `@mfe/ui`.
- **vercel-react-best-practices** — component structure, lazy loading, Suspense boundaries.
- **mf** — verifying MF provider config and standalone/federated operation.
- **tailwind-design-system** — semantic design tokens for styling.
