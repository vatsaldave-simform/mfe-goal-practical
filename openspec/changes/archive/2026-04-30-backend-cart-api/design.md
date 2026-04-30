## Context

The backend currently serves authentication (`/api/auth/*`) and products (`/api/products`) via Express + Prisma (SQLite). Users can register, log in (JWT in httpOnly cookie), and browse products. The next step in the e-commerce flow is a persistent server-side cart that lets authenticated users manage items before checkout.

The existing backend patterns are well-established: Zod for request validation, Prisma for data access, `auth` middleware for JWT verification, and `Promise.all` for concurrent queries.

## Goals / Non-Goals

**Goals:**
- Implement a per-user persistent cart backed by Prisma (Cart + CartItem tables)
- Expose RESTful CRUD endpoints for cart management behind auth middleware
- Compute cart total server-side (price × quantity, sum in cents)
- Return joined product data with cart items (name, image, price) for frontend display
- Follow existing backend patterns (Zod validation, typed middleware, Express Router)

**Non-Goals:**
- Checkout / order flow
- Guest / anonymous carts
- Cart expiration, time-based cleanup, or max-items limit
- Stock validation or reservation on add-to-cart
- Price locking (cart always reflects current product price)
- Frontend integration (storefront MFE changes are a separate change)

## Decisions

### D1: One cart per user, created lazily

Each user has at most one active cart. The cart is created automatically on the first `POST /api/cart/items` call — no explicit "create cart" endpoint. This keeps the API surface minimal.

```
┌─────────┐       ┌──────────┐       ┌───────────┐
│  User   │──1:1──│   Cart   │──1:N──│ CartItem  │
└─────────┘       └──────────┘       └───────────┘
                                           │
                                        N:1│
                                     ┌───────────┐
                                     │  Product  │
                                     └───────────┘
```

**Rationale**: Avoids orphaned empty carts and a separate endpoint to manage cart lifecycle.

### D2: Prisma schema additions

```prisma
model Cart {
  id        String     @id @default(uuid())
  userId    String     @unique
  user      User       @relation(fields: [userId], references: [id])
  items     CartItem[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model CartItem {
  id        String   @id @default(uuid())
  cartId    String
  cart      Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  quantity  Int      @default(1)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([cartId, productId])
}
```

Key choices:
- `@@unique([cartId, productId])`: Prevents duplicate items — adding same product increments quantity instead
- `onDelete: Cascade` on CartItem→Cart: Clearing a cart deletes all items
- `userId @unique` on Cart: Enforces one cart per user at the DB level

### D3: Cart total computed at query time

The `total` field is NOT stored — it's derived from `SUM(item.quantity * product.price)`. This guarantees the total always reflects current product prices without needing price-sync jobs.

**Rationale**: Prices may change; storing totals creates stale data. Per ADR-006, the API response includes everything the frontend needs.

### D4: Route module structure

File: `apps/backend/src/routes/cart.ts`

```
Request flow:

  Client ──→ auth middleware ──→ cart router ──→ Prisma ──→ Response
                  │
                  └─ attaches req.user (id, email, name)
```

All four endpoints go through `auth` middleware. The router is registered in `src/index.ts` as:
```ts
app.use("/api/cart", auth, cartRouter);
```

**Ownership**: `apps/backend` (the Express server app)

### D5: Zod validation schemas

Per ADR-008, Zod schemas handle request validation:

| Endpoint | Schema | Fields |
|----------|--------|--------|
| POST /api/cart/items | `addItemSchema` | `productId: string (uuid)`, `quantity: number (int, min 1, default 1)` |
| PATCH /api/cart/items/:id | `updateItemSchema` | `quantity: number (int, min 1)` |

Validation uses the existing `validate` middleware pattern: `validate(schema)` → parses `req.body` or returns 400.

### D6: Response shape

```
GET /api/cart response:
{
  "id": "cart-uuid",
  "items": [
    {
      "id": "cart-item-uuid",
      "productId": "product-uuid",
      "quantity": 2,
      "product": {
        "id": "product-uuid",
        "name": "Wireless Mouse",
        "price": 2999,
        "image": "/images/mouse.jpg"
      }
    }
  ],
  "total": 5998,
  "itemCount": 2
}
```

- `total`: sum of `quantity * product.price` across all items (in cents)
- `itemCount`: sum of quantities (useful for cart badge in nav)
- Product joined with `select` to avoid leaking unnecessary fields

### D7: Duplicate product handling

When `POST /api/cart/items` receives a `productId` that already exists in the cart, the quantity is **incremented** by the request's `quantity` value (upsert pattern), rather than returning an error.

**Rationale**: Better UX — user taps "Add to Cart" multiple times without error. Uses Prisma `upsert` with `@@unique([cartId, productId])`.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| No stock validation — user can add more than available | Acceptable for learning scope; validate at checkout (future change) |
| Cart total recomputed on every GET | Carts are small (< 50 items); overhead is negligible for SQLite |
| Product deletion orphans CartItems | Add `onDelete: Cascade` on CartItem→Product, or filter out null products at query time. Choosing cascade for simplicity. |
| No cart size limit | Acceptable for now; add `max 50 items` constraint if needed later |
