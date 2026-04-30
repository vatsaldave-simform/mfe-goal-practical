## Why

The e-commerce platform has authentication, products, and cart functionality but no way for users to place orders. Orders are the core revenue event — without them, the cart is a dead end. Adding an Orders API completes the purchase flow and gives the account MFE data to display in an "Order History" page.

## What Changes

- Add `Order` and `OrderItem` models to the Prisma schema with status tracking
- Create `GET /api/orders` endpoint to list the authenticated user's orders
- Create `GET /api/orders/:id` endpoint to retrieve a single order with items
- Create `POST /api/orders` endpoint to convert the user's cart into a new order (snapshot product name/price at order time)
- Add `OrderStatus` enum: `pending | confirmed | shipped | delivered`
- Add orders route module to the Express backend

## Capabilities

### New Capabilities
- `orders-api`: REST endpoints for creating and retrieving orders, including data models, validation, cart-to-order conversion, and price/name snapshotting

### Modified Capabilities
<!-- No existing spec requirements are changing — cart API behavior stays the same, we just read from it -->

## Non-goals

- Payment processing or payment gateway integration
- Order cancellation or refund endpoints
- Admin/staff order management endpoints
- Email notifications on order status changes
- Inventory/stock decrement on order placement (future enhancement)
- Frontend UI for orders (separate change)

## Impact

- **Database**: New `Order` and `OrderItem` tables via Prisma migration
- **Backend code**: New `apps/backend/src/routes/orders.ts` route file, registered in Express app
- **Existing cart**: `POST /api/orders` reads and clears the user's cart after order creation — no cart schema changes needed
- **Shared types**: Order-related TypeScript types needed in `packages/shared`
- **ADRs**: Follows ADR-003 (JWT auth via httpOnly cookies), ADR-006 (API layer patterns)

## Skills

- `tanstack-query-best-practices` — query key factories for orders (packages/api future use)
- `typescript-advanced-types` — shared Order types in packages/shared
