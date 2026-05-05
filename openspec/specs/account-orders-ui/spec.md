## ADDED Requirements

### Requirement: Account MFE registers orders and orders/:id routes in App.tsx
The account MFE `App.tsx` SHALL include `<Route path="orders" element={<OrdersPage />} />` and `<Route path="orders/:id" element={<OrderDetailPage />} />` inside its existing `<Routes>` block. Both pages SHALL be imported from the pages barrel export.

#### Scenario: Orders route renders OrdersPage
- **WHEN** the account MFE is mounted and the path matches `orders`
- **THEN** the `OrdersPage` component SHALL render

#### Scenario: Order detail route renders OrderDetailPage
- **WHEN** the account MFE is mounted and the path matches `orders/:id`
- **THEN** the `OrderDetailPage` component SHALL render
- **AND** the `:id` parameter SHALL be accessible via `useParams()`

#### Scenario: Existing routes remain unchanged
- **WHEN** the path matches `login`, `register`, or `profile`
- **THEN** the existing page components SHALL render as before

### Requirement: OrdersPage displays a list of the user's orders
The `OrdersPage` component at `apps/account/src/pages/OrdersPage.tsx` SHALL call `useOrders()` from `@mfe/api` and render each order as a card showing the order ID (truncated), status, total (formatted via `formatCurrency` from `@mfe/shared`), item count, and creation date.

#### Scenario: Orders load successfully
- **WHEN** `useOrders()` returns data with one or more orders
- **THEN** the page SHALL render one card per `OrderSummary`
- **AND** each card SHALL display the order's `status` as a Badge component
- **AND** each card SHALL display the `total` formatted as currency
- **AND** each card SHALL display the `itemCount` and `createdAt` (human-readable date)
- **AND** each card SHALL link to the order detail page at relative path `orders/{id}`

#### Scenario: Orders are loading
- **WHEN** `useOrders()` is in a loading state (`isLoading` is true)
- **THEN** the page SHALL render skeleton placeholders (at least 3) instead of order cards

#### Scenario: No orders exist
- **WHEN** `useOrders()` returns data with an empty `orders` array
- **THEN** the page SHALL render an empty state message indicating no orders have been placed
- **AND** the empty state SHALL include a link or prompt to browse products

#### Scenario: Orders fetch fails
- **WHEN** `useOrders()` returns an error
- **THEN** the page SHALL render an error message describing the failure
- **AND** the page SHALL include a retry mechanism (e.g., a button that calls `refetch()`)

### Requirement: OrderDetailPage displays a single order with line items
The `OrderDetailPage` component at `apps/account/src/pages/OrderDetailPage.tsx` SHALL read the `id` parameter from the URL via `useParams()`, call `useOrder(id)` from `@mfe/api`, and render the order's metadata and a table of line items.

#### Scenario: Order detail loads successfully
- **WHEN** `useOrder(id)` returns data for a valid order
- **THEN** the page SHALL display the order's `id`, `status` (as a Badge), `createdAt` (formatted date), and `total` (formatted currency) in a header section
- **AND** the page SHALL render a table of `items` with columns: product name, quantity, unit price (formatted), and line total (price × quantity, formatted)
- **AND** the table SHALL display a footer row showing the order total

#### Scenario: Order detail is loading
- **WHEN** `useOrder(id)` is in a loading state
- **THEN** the page SHALL render skeleton placeholders for both the header and the items table

#### Scenario: Order not found
- **WHEN** `useOrder(id)` returns a 404 error
- **THEN** the page SHALL display a "not found" message
- **AND** the page SHALL include a link back to the orders list

#### Scenario: Back navigation to orders list
- **WHEN** the user is on the order detail page
- **THEN** the page SHALL include a back link/button that navigates to the orders list (relative path `../orders` or equivalent)

### Requirement: Orders pages use @mfe/ui components with semantic design tokens
All order pages SHALL use components from `@mfe/ui` (Card, Badge, Button, Table, Skeleton) and semantic Tailwind design tokens (e.g., `text-muted-foreground`, `bg-card`) — never raw color classes like `bg-blue-500`.

#### Scenario: Card component used for order cards
- **WHEN** rendering order summaries on the OrdersPage
- **THEN** each order SHALL be wrapped in a Card component from `@mfe/ui`

#### Scenario: Badge component used for order status
- **WHEN** rendering an order's status on either page
- **THEN** the status SHALL be displayed using a Badge component from `@mfe/ui`

#### Scenario: Table component used for line items
- **WHEN** rendering order items on the OrderDetailPage
- **THEN** the items SHALL be displayed using Table, TableHeader, TableBody, TableRow, TableHead, and TableCell components from `@mfe/ui`

#### Scenario: Skeleton component used for loading states
- **WHEN** either page is in a loading state
- **THEN** Skeleton components from `@mfe/ui` SHALL be used for placeholder content

### Requirement: Pages barrel export includes OrdersPage and OrderDetailPage
The `apps/account/src/pages/index.ts` barrel export SHALL export `OrdersPage` and `OrderDetailPage` alongside the existing `LoginPage`, `RegisterPage`, and `ProfilePage` exports.

#### Scenario: All pages are importable from the barrel
- **WHEN** a module imports from `./pages`
- **THEN** `LoginPage`, `RegisterPage`, `ProfilePage`, `OrdersPage`, and `OrderDetailPage` SHALL all be available as named exports

### Requirement: Account MFE orders work in standalone mode
The account MFE SHALL serve orders pages at `/account/orders` and `/account/orders/:id` when running standalone at `localhost:3002` (using the existing `basename="/account"` in `bootstrap.tsx`).

#### Scenario: Standalone orders list
- **WHEN** navigating to `http://localhost:3002/account/orders` while authenticated
- **THEN** the OrdersPage SHALL render and display the user's orders

#### Scenario: Standalone order detail
- **WHEN** navigating to `http://localhost:3002/account/orders/{id}` while authenticated
- **THEN** the OrderDetailPage SHALL render and display the order's details

### Requirement: Account MFE orders work in federated mode via host
The account MFE orders pages SHALL function correctly when loaded via Module Federation through the host at `localhost:3000`. The host routes `/orders/*` to the AccountApp remote behind AuthGuard.

#### Scenario: Federated orders list
- **WHEN** an authenticated user navigates to `http://localhost:3000/orders` in the host
- **THEN** the host SHALL load the account MFE via Module Federation
- **AND** the OrdersPage SHALL render within the host's shell layout

#### Scenario: Federated order detail
- **WHEN** an authenticated user navigates to `http://localhost:3000/orders/{id}` in the host
- **THEN** the OrderDetailPage SHALL render within the host's shell layout
- **AND** navigation between orders list and detail SHALL use client-side routing (no full page reload)
