## 1. Verify UI component availability in @mfe/ui

- [x] 1.1 Confirm Card, Badge, Button, Table (Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter), and Skeleton are exported from `packages/ui/src/index.ts`. Add any missing re-exports. **Target**: `packages/ui`. **Skills to load**: `shadcn`.

## 2. Create OrdersPage

- [x] 2.1 Create `apps/account/src/pages/OrdersPage.tsx` — call `useOrders()` from `@mfe/api`, render a page heading ("Order History") and one Card per order showing: truncated order ID, status (Badge), total (formatCurrency from `@mfe/shared`), item count, and formatted date. Each card links to `orders/{id}` (relative). Include loading state (3 Skeleton cards), empty state (message + link to `/products`), and error state (message + refetch button). **Target**: `apps/account`. **Skills to load**: `tanstack-query-best-practices`, `shadcn`, `vercel-react-best-practices`, `tailwind-design-system`.

## 3. Create OrderDetailPage

- [x] 3.1 Create `apps/account/src/pages/OrderDetailPage.tsx` — read `id` from `useParams()`, call `useOrder(id)` from `@mfe/api`. Render a header Card with order ID, status (Badge), date, and total, plus a Table of line items (name, qty, unit price, line total) with a footer row showing the order total. Include back link to orders list, loading skeletons, and 404/error handling. **Target**: `apps/account`. **Skills to load**: `tanstack-query-best-practices`, `shadcn`, `vercel-react-best-practices`, `tailwind-design-system`.

## 4. Wire routes and exports

- [x] 4.1 Update `apps/account/src/pages/index.ts` — add `OrdersPage` and `OrderDetailPage` to the barrel export. **Target**: `apps/account`.
- [x] 4.2 Update `apps/account/src/App.tsx` — import `OrdersPage` and `OrderDetailPage` from `./pages` and add `<Route path="orders" element={<OrdersPage />} />` and `<Route path="orders/:id" element={<OrderDetailPage />} />` inside the existing `<Routes>`. **Target**: `apps/account`. **Skills to load**: `mf`.

## 5. Verify standalone and federated operation

- [X] 5.1 Run the account MFE standalone (`pnpm --filter @mfe/account dev`) and verify `/account/orders` and `/account/orders/:id` render correctly. **Target**: `apps/account`. **Skills to load**: `mf`.
- [X] 5.2 Run the full dev stack (`turbo run dev`) and verify `/orders` and `/orders/:id` work through the host shell behind AuthGuard. Confirm navigation between orders list and detail is client-side (no full reload). **Target**: `apps/host`, `apps/account`. **Skills to load**: `mf`.
