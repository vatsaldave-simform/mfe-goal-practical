## 1. Database Schema & Migration

- [x] 1.1 Add Cart and CartItem models to `apps/backend/prisma/schema.prisma` with relations to User and Product, unique constraints (`userId` on Cart, `[cartId, productId]` on CartItem), and cascade delete rules
  - **Target**: `apps/backend`
  - **Skills to load**: none (Prisma schema only)

- [x] 1.2 Add reverse relation fields on User (`cart: Cart?`) and Product (`cartItems: CartItem[]`) models in the schema
  - **Target**: `apps/backend`

- [x] 1.3 Run `prisma migrate dev --name add_cart` to generate and apply the migration
  - **Target**: `apps/backend`

- [x] 1.4 Verify generated Prisma client includes Cart and CartItem types (run `prisma generate`)
  - **Target**: `apps/backend`

## 2. Cart Route Implementation

- [x] 2.1 Create `apps/backend/src/routes/cart.ts` with the Express Router scaffold, Zod validation schemas (`addItemSchema`, `updateItemSchema`), and typed request handler signatures
  - **Target**: `apps/backend`
  - **Skills to load**: `typescript-advanced-types`

- [x] 2.2 Implement `GET /` handler — fetch user's cart with items + joined product data (select: id, name, price, image), compute `total` and `itemCount`, return empty cart structure if none exists
  - **Target**: `apps/backend`

- [x] 2.3 Implement `POST /items` handler — validate body with `addItemSchema`, verify product exists (404 if not), lazily create cart, upsert cart item (increment quantity if product already in cart), return created/updated item with joined product
  - **Target**: `apps/backend`

- [x] 2.4 Implement `PATCH /items/:id` handler — validate body with `updateItemSchema`, find item (scoped to user's cart), return 404 if not found or wrong user, update quantity, return updated item with joined product
  - **Target**: `apps/backend`

- [x] 2.5 Implement `DELETE /items/:id` handler — find item (scoped to user's cart), return 404 if not found or wrong user, delete item, return success message
  - **Target**: `apps/backend`

## 3. Route Registration & Wiring

- [x] 3.1 Register cart router in `apps/backend/src/index.ts` as `app.use("/api/cart", auth, cartRouter)` — all cart endpoints require authentication
  - **Target**: `apps/backend`

## 4. Verification

- [x] 4.1 Start backend and manually test all four endpoints with curl/httpie (login first to get cookie, then test GET/POST/PATCH/DELETE flows)
  - **Target**: `apps/backend`

- [x] 4.2 Verify TypeScript compiles cleanly (`pnpm --filter @mfe/backend build` or `tsc --noEmit`)
  - **Target**: `apps/backend`
