## 1. Prisma Schema & Migration

- [x] 1.1 Add `Product` model to `apps/backend/prisma/schema.prisma` with fields: `id` (String, uuid), `name` (String), `description` (String), `price` (Int), `image` (String), `category` (String), `stock` (Int, default 0), `createdAt` (DateTime, default now)
  - **Target**: `apps/backend`
  - **Skills to load**: `prisma-cli`

- [x] 1.2 Run `prisma migrate dev --name add-products` to generate the migration SQL and create the Product table in dev.db
  - **Target**: `apps/backend`
  - **Skills to load**: `prisma-cli`

- [x] 1.3 Run `prisma generate` to regenerate the Prisma client with the Product model types
  - **Target**: `apps/backend`
  - **Skills to load**: `prisma-cli`

## 2. Seed Data

- [x] 2.1 Extend `apps/backend/prisma/seed.ts` to upsert at least 12 sample products
  - **Target**: `apps/backend`
  - **Skills to load**: `prisma-cli`

- [x] 2.2 Run `prisma db seed` and verify products are created in the database. Run again to confirm idempotency (no duplicates)
  - **Target**: `apps/backend`
  - **Skills to load**: `prisma-cli`

## 3. Products Router Implementation

- [x] 3.1 Create `apps/backend/src/routes/products.ts` with a Zod schema for query param validation: `search` (optional string), `category` (optional string), `sort` (optional enum: price_asc, price_desc, name_asc, newest), `page` (coerced int, min 1, default 1), `limit` (coerced int, min 1, max 100, default 12)
  - **Target**: `apps/backend`
  - **Skills to load**: none (Zod already in use)

- [x] 3.2 Implement `GET /` handler (list products): parse query params with Zod (fallback to defaults on failure), build Prisma `where` clause (search → `contains` on name/description OR, category → exact match), build `orderBy` from sort param, run `Promise.all([findMany, count])`, return `{ data, pagination }` envelope
  - **Target**: `apps/backend`
  - **Skills to load**: none

- [x] 3.3 Implement `GET /:id` handler (single product): look up by id with `prisma.product.findUnique`, return product directly or `404 { error: "Product not found" }`
  - **Target**: `apps/backend`
  - **Skills to load**: none

## 4. Mount Router & Verify

- [x] 4.1 Import products router in `apps/backend/src/index.ts` and mount with `app.use("/api/products", productsRouter)`
  - **Target**: `apps/backend`
  - **Skills to load**: none

- [x] 4.2 Start the backend server and manually validate: `GET /api/products` returns paginated products, `GET /api/products?search=...` filters correctly, `GET /api/products?category=...` filters correctly, `GET /api/products?sort=price_asc` sorts correctly, `GET /api/products/:id` returns a single product, `GET /api/products/nonexistent-id` returns 404
  - **Target**: `apps/backend`
  - **Skills to load**: none
