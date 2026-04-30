## Context

The backend already provides authenticated endpoints for products and cart (ADR-003 JWT via httpOnly cookies). Cart holds ephemeral shopping state; orders represent the committed purchase record. The Orders API closes the purchase loop by converting a cart into a persistent order with snapshotted item data.

Current data path:
```
[User] → POST /api/cart/items → Cart/CartItem (live product refs)
[User] → POST /api/orders    → Order/OrderItem (snapshotted name+price)
```

Prisma (SQLite) manages all models. Express routes follow the established pattern in `apps/backend/src/routes/`.

## Goals / Non-Goals

**Goals:**
- Persist orders with immutable item snapshots (name, price at order time)
- Provide list and detail retrieval for authenticated users
- Clear the user's cart atomically on successful order creation
- Follow existing backend patterns (Zod validation, Prisma, auth middleware)

**Non-Goals:**
- Payment integration (orders start as `pending` immediately)
- Order status mutation endpoints (admin feature, future change)
- Inventory decrement on order placement
- Frontend UI (separate change)

## Decisions

### D1: Prisma schema — Order + OrderItem models

```
Order      ← userId FK → User (one-to-many)
OrderItem  ← orderId FK → Order (one-to-many)
           ← productId FK → Product (soft reference for analytics — NOT for display)
```

OrderItem stores `name` and `price` (snapshot columns) so displayed data is immune to future product changes. `productId` is retained as a nullable soft reference for potential future analytics/linking but is not used for display.

**Rationale**: Snapshotting is the standard e-commerce pattern — avoids price drift on historical orders.

### D2: OrderStatus as a string enum column

Store status as a plain string with Prisma `@default("pending")`. Valid values: `pending`, `confirmed`, `shipped`, `delivered`.

**Alternative considered**: Prisma native enum — rejected because SQLite doesn't support `enum` natively; string column with application-level validation is simpler and portable.

### D3: Cart-to-Order conversion in a Prisma transaction

`POST /api/orders` runs inside `prisma.$transaction()`:
1. Read cart + items + product data
2. Create Order + OrderItems (snapshotting name/price)
3. Delete all CartItems for that cart
4. Return the created order

```
┌─────────────────────────────────────────────────┐
│  $transaction                                    │
│                                                  │
│  ┌──────────────┐    ┌───────────────────────┐  │
│  │ Read Cart    │───▶│ Create Order + Items   │  │
│  │ + Items      │    │ (snapshot name/price)  │  │
│  └──────────────┘    └───────────────────────┘  │
│                              │                   │
│                              ▼                   │
│                      ┌───────────────────────┐  │
│                      │ Delete CartItems       │  │
│                      └───────────────────────┘  │
└─────────────────────────────────────────────────┘
```

**Rationale**: Atomicity prevents orphaned state (order created but cart not cleared, or vice-versa). Per tanstack-query invalidation pattern, the frontend will invalidate both `cartKeys` and `orderKeys` after a successful mutation.

### D4: Route module ownership

| Piece | Owner |
|-------|-------|
| `Order`/`OrderItem` models | `apps/backend/prisma/schema.prisma` |
| `POST/GET /api/orders` | `apps/backend/src/routes/orders.ts` |
| Route registration | `apps/backend/src/index.ts` (behind `auth` middleware) |
| Zod validation schemas | inline in route file (consistent with cart/products) |

### D5: Response shape conventions

Follow existing patterns (cart route):
- List: `{ orders: Order[] }` (array wrapper for extensibility — pagination later)
- Detail: flat Order object with nested `items[]`
- Create: returns the created Order (201 status)
- Errors: `{ error: string }` with appropriate HTTP status

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Cart cleared but order fails mid-transaction | Prisma `$transaction` ensures atomicity — all-or-nothing |
| Empty cart submitted as order | Validate cart has ≥1 item before creating; return 400 |
| Product deleted between cart-add and order-place | Snapshot at order time captures whatever data is in CartItem's joined Product; if product row deleted, CASCADE will have removed CartItem already (existing schema behavior) |
| No pagination on order list | Acceptable for MVP — user order counts will be low; add `?page=` later |
| OrderStatus only set to `pending` | Future admin endpoints will update status; current scope is creation + retrieval only |
