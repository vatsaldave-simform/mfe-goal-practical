## Context

The backend currently serves only authentication endpoints (`/api/auth/*`) backed by a `User` model in Prisma/SQLite. The storefront MFE needs product data to render catalog pages. This design adds a read-only Products API following the same patterns established by the auth routes (Prisma for persistence, Zod for validation, Express router mounted in `src/index.ts`).

Current request flow:

```
storefront MFE → @mfe/api (axios) → Express backend → Prisma → SQLite
```

The products endpoints follow the identical path but without the `auth` middleware gate.

## Goals / Non-Goals

**Goals:**

- Provide `GET /api/products` with filtering, search, sorting, and cursor-free offset pagination
- Provide `GET /api/products/:id` for single-product retrieval
- Add a `Product` model to the Prisma schema and generate a migration
- Seed the database with representative sample products (≥12 items across multiple categories)
- Design response shapes that align with TanStack Query consumption patterns (per tanstack-query `qk-factory-pattern`)

**Non-Goals:**

- Write endpoints (POST/PUT/DELETE) — deferred to admin API change
- Image storage or upload — `image` field is a plain URL string
- Full-text search (FTS5) — simple `LIKE` on name/description is sufficient for the learning scope
- API versioning or rate limiting
- Shared `Product` TypeScript type in `packages/shared` (future change; backend owns the type for now)

## Decisions

### D1: Product model lives in the existing Prisma schema

**Choice**: Add the `Product` model to `apps/backend/prisma/schema.prisma` alongside `User`.

**Alternatives considered**:
- Separate schema file per domain → Prisma doesn't support multi-file schemas without tooling hacks; adds complexity for no benefit at this scale.

**Rationale**: Single schema is the standard Prisma pattern. One `prisma migrate dev` manages all tables.

### D2: Price stored as integer cents

**Choice**: `price Int` representing cents (e.g., 1999 = $19.99).

**Alternatives considered**:
- `Decimal` type → SQLite doesn't have a native decimal; Prisma maps it to TEXT. Integer math avoids floating-point display bugs and is simpler for frontend `formatCurrency()`.
- `Float` → Floating-point rounding errors with currency are a well-known footgun.

**Rationale**: Integer cents is the industry standard for monetary values in APIs. The frontend divides by 100 for display (per ADR-006 response shape design).

### D3: Pagination via offset/limit (not cursor-based)

**Choice**: `?page=1&limit=12` with response containing `{ data, pagination: { page, limit, total, totalPages } }`.

**Alternatives considered**:
- Cursor-based pagination → Better for infinite scroll but adds complexity. Product catalogs are browsed page-by-page with a page indicator.
- No pagination (return all) → Doesn't scale even with 50+ seed products.

**Rationale**: Offset pagination maps directly to a page number UI, is simple to implement with Prisma `skip`/`take`, and the response metadata lets TanStack Query prefetch the next page (per tanstack-query `prefetch-pattern`).

### D4: Filtering and sorting via query parameters validated with Zod

**Choice**: Validate query params with a Zod schema using `.safeParse(req.query)`. Invalid params return defaults rather than 400 errors (lenient parsing for GET requests).

Schema:
```
search:   z.string().optional()          → LIKE %keyword% on name + description
category: z.string().optional()          → exact match on category field
sort:     z.enum([...]).optional()        → price_asc | price_desc | name_asc | newest
page:     z.coerce.number().int().min(1).default(1)
limit:    z.coerce.number().int().min(1).max(100).default(12)
```

**Alternatives considered**:
- No validation (raw `req.query`) → Type-unsafe; risks SQL injection via Prisma if we ever add raw queries.
- Strict validation (400 on invalid) → Poor UX for bookmarked URLs with stale params.

**Rationale**: Zod coercion handles string→number for query params naturally. Defaulting invalid values is friendlier for public GET endpoints (per ADR-008 Zod validation strategy).

### D5: Response envelope for list endpoint

**Choice**: Wrap list responses in a standard envelope:

```json
{
  "data": [ ...products ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 47,
    "totalPages": 4
  }
}
```

Single-product endpoint returns unwrapped: `{ "id": "...", "name": "...", ... }`

**Alternatives considered**:
- Flat array response → No pagination metadata; client can't render page controls.
- All endpoints wrapped → Over-engineering for single resource; TanStack Query `select` works better with direct objects.

**Rationale**: List needs metadata for pagination UI. Single item is simpler unwrapped — maps directly to a `useQuery` data shape without needing `.data` access (per tanstack-query best practices).

### D6: Search uses Prisma `contains` (case-insensitive via SQLite collation)

**Choice**: `where: { OR: [{ name: { contains: search } }, { description: { contains: search } }] }`

SQLite's `LIKE` is case-insensitive for ASCII by default, and Prisma's `contains` maps to `LIKE '%value%'` on SQLite.

**Alternatives considered**:
- Raw SQL with `GLOB` → Loses Prisma type-safety.
- SQLite FTS5 virtual table → Overkill for ≤100 products; would require raw queries.

**Rationale**: Simple, type-safe, adequate for the data volume. Can be upgraded to FTS5 or a search service if the product catalog grows significantly.

### D7: Route file ownership

**Choice**: `apps/backend/src/routes/products.ts` owns the router. Mounted in `src/index.ts` as `app.use("/api/products", productsRouter)`.

```
apps/backend/
├── src/
│   ├── index.ts              ← mounts /api/products
│   └── routes/
│       ├── auth.ts           ← existing
│       └── products.ts       ← NEW
└── prisma/
    └── schema.prisma         ← Product model added
```

**Rationale**: Mirrors the existing `auth.ts` pattern. One router file per domain resource.

## Data Flow

```
┌─────────────┐     GET /api/products?search=phone&page=2
│  Frontend   │────────────────────────────────────────────►┐
│ (@mfe/api)  │                                             │
└─────────────┘                                             ▼
                                                 ┌──────────────────┐
                                                 │  Express Router   │
                                                 │  routes/products  │
                                                 └────────┬─────────┘
                                                          │
                                                 1. Parse & validate query params (Zod)
                                                 2. Build Prisma `where` + `orderBy`
                                                 3. Run count + findMany in parallel
                                                          │
                                                          ▼
                                                 ┌──────────────────┐
                                                 │   Prisma Client   │
                                                 │   (SQLite)        │
                                                 └────────┬─────────┘
                                                          │
                                                          ▼
                                                 ┌──────────────────┐
                                                 │   dev.db (SQLite) │
                                                 └──────────────────┘
```

### Parallel queries for list endpoint (per vercel-react-best-practices Promise.all pattern):

```typescript
const [products, total] = await Promise.all([
  prisma.product.findMany({ where, orderBy, skip, take }),
  prisma.product.count({ where }),
]);
```

## Risks / Trade-offs

- **[SQLite LIKE performance]** → Acceptable for ≤200 products. If catalog grows, add an index on `name` or migrate to FTS5.
- **[Offset pagination skip cost]** → `skip` scans rows sequentially in SQLite. Fine for small datasets. Cursor pagination would be the fix if products reach thousands.
- **[No auth on products]** → Intentionally public. If product visibility rules are needed later, add middleware selectively.
- **[Price as Int]** → Frontend must divide by 100 for display. Document this in the response shape. `formatCurrency()` in `@mfe/shared` will handle it.
- **[Case sensitivity]** → SQLite `LIKE` is case-insensitive for ASCII but not Unicode. Acceptable for English product names in a learning project.

## Open Questions

- None — scope is well-defined for a CRUD-read-only API with existing patterns to follow.
