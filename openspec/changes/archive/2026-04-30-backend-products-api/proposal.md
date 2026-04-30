## Why

The storefront MFE needs product data to display listings and detail pages. Currently the backend has no products endpoint — only auth routes exist. Adding a read-only Products API unlocks frontend development of the product catalog (browsing, searching, filtering, pagination) without requiring authentication.

## What Changes

- Add a `Product` model to the Prisma schema (id, name, description, price in cents, image URL, category, stock, createdAt)
- Create a new migration to provision the `Product` table in SQLite
- Extend the seed script to populate sample products across multiple categories
- Implement `GET /api/products` with query params: `search`, `category`, `sort`, `page`, `limit`
- Implement `GET /api/products/:id` returning a single product by ID
- Register the products router in the Express app entry point

## Capabilities

### New Capabilities

- `products-api`: Defines the Product data model, REST endpoints (`GET /api/products`, `GET /api/products/:id`), query/filter/sort/pagination behaviour, response shapes, error handling, and seed data requirements.

### Modified Capabilities

- `backend-prisma-setup`: The Prisma schema gains a new `Product` model and a corresponding migration. Seed script is extended with product seed data.

## Impact

- **Schema**: `apps/backend/prisma/schema.prisma` — new `Product` model added
- **Migrations**: New migration SQL file under `apps/backend/prisma/migrations/`
- **Seed**: `apps/backend/prisma/seed.ts` — extended with product sample data
- **Routes**: New `apps/backend/src/routes/products.ts` file
- **Entry point**: `apps/backend/src/index.ts` — mounts `/api/products` router
- **Dependencies**: No new runtime dependencies (Prisma already configured)
- **Consumers**: `@mfe/api` package will later add query hooks for these endpoints; storefront MFE will consume them
- **Auth**: Neither endpoint requires authentication (public read-only)

## Non-goals

- Product creation/update/delete (admin write API — future change)
- Image upload or CDN integration (images are plain URL strings)
- Full-text search engine (simple SQL LIKE matching is sufficient)
- Cart or order integration (separate domain)
- Rate limiting or caching headers (deferred to a future hardening pass)

## Skills

- **turborepo** — monorepo task pipeline (migration/seed scripts)
- **tanstack-query-best-practices** — informs response shape design for future query hooks in `@mfe/api`
- **typescript-advanced-types** — shared Product type in `packages/shared`

## Relevant ADRs

- **ADR-006 (API Layer Design)** — endpoints follow RESTful patterns; response shapes designed for TanStack Query consumption
- **ADR-002 (State Management)** — product data is server state (TanStack Query), never Zustand
- **ADR-008 (Form Handling)** — Zod schemas for query param validation on the server side
