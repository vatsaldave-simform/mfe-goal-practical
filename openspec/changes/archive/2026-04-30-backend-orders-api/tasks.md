## 1. Prisma Schema & Migration

- [x] 1.1 Add `Order` and `OrderItem` models to `apps/backend/prisma/schema.prisma` with fields per spec (id, userId, status defaulting to "pending", total, createdAt for Order; id, orderId, productId, name, price, quantity for OrderItem). Add relations: User hasMany Orders, Order hasMany OrderItems, Product hasMany OrderItems (soft ref). Cascade delete OrderItems on Order delete. **Target**: `apps/backend` **Skills to load**: none (Prisma schema only)
- [x] 1.2 Run `prisma migrate dev --name add_orders` to generate and apply the migration. Verify the migration file is created under `apps/backend/prisma/migrations/`. **Target**: `apps/backend`

## 2. Orders Route Implementation

- [x] 2.1 Create `apps/backend/src/routes/orders.ts` with Express Router. Add Zod validation schema for `GET /api/orders/:id` (id param as UUID). Import prisma client and User type following the cart route pattern. **Target**: `apps/backend` **Skills to load**: none (follows existing cart.ts pattern)
- [x] 2.2 Implement `GET /api/orders` — query orders by authenticated userId, sorted by `createdAt` desc. Return `{ orders: [...] }` with each order containing `id`, `status`, `total`, `createdAt`, and computed `itemCount`. Return empty array if no orders. **Target**: `apps/backend`
- [x] 2.3 Implement `GET /api/orders/:id` — validate UUID param with Zod, query order by id AND userId (prevents accessing other users' orders). Include items with `id`, `productId`, `name`, `price`, `quantity`. Return 404 `{ error: "Order not found" }` if not found or belongs to another user. Compute `total` from items. **Target**: `apps/backend`
- [x] 2.4 Implement `POST /api/orders` — inside `prisma.$transaction()`: read user's cart with items + product data, validate cart is not empty (return 400 `{ error: "Cart is empty" }`), create Order with status `"pending"` and OrderItems snapshotting product name/price, compute total, delete CartItems, return 201 with created order. **Target**: `apps/backend`

## 3. Route Registration

- [x] 3.1 Import `ordersRouter` in `apps/backend/src/index.ts` and register it at `/api/orders` behind the `auth` middleware, following the same pattern as the cart route. **Target**: `apps/backend` **Skills to load**: none (one-line registration)

## 4. Verification

- [x] 4.1 Start the backend dev server and verify all three endpoints work with manual curl/httpie requests: create a user, add items to cart, place an order, list orders, get order detail. Confirm cart is cleared after order creation and item snapshots are correct. **Target**: `apps/backend`
