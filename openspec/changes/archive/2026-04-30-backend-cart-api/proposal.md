## Why

The storefront MFE needs a persistent server-side cart so users can add products, adjust quantities, and see their cart across sessions. Currently no cart endpoints exist — the backend only serves products and authentication. Adding a cart API is the next logical step toward a functional e-commerce flow.

## What Changes

- Add `Cart` and `CartItem` models to the Prisma schema (one cart per user, items reference products)
- Create a new Prisma migration for the cart tables
- Implement authenticated CRUD endpoints for cart management:
  - `GET /api/cart` — fetch the current user's cart with items + joined product data
  - `POST /api/cart/items` — add an item to the cart (creates cart if needed)
  - `PATCH /api/cart/items/:id` — update item quantity
  - `DELETE /api/cart/items/:id` — remove an item from the cart
- All endpoints require JWT authentication (reuse existing auth middleware)
- Cart total is computed server-side in cents

## Non-goals

- Checkout / order creation (separate future change)
- Guest / anonymous carts (requires auth for now)
- Cart expiration or cleanup
- Coupon / discount logic
- Frontend integration (storefront MFE will consume this in a later change)

## Capabilities

### New Capabilities
- `cart-api`: CRUD endpoints for managing a user's shopping cart, including data models, validation, and authenticated access

### Modified Capabilities
_(none — no existing spec requirements are changing)_

## Impact

- **Database**: New `Cart` and `CartItem` tables; new migration
- **Backend code**: New `src/routes/cart.ts` route module, registered in `src/index.ts`
- **Dependencies**: No new runtime deps (Prisma + Express + Zod already in place)
- **API surface**: Four new authenticated endpoints under `/api/cart`
- **ADRs**: Follows ADR-003 (JWT auth via httpOnly cookies), ADR-006 (API layer design)

## Skills

- `tanstack-query-best-practices` (for future frontend hooks, not this change)
- `typescript-advanced-types` (Zod schema inference for request validation)
- `turborepo` (monorepo build pipeline awareness)
