## Context

`@mfe/shared` is currently an empty scaffold (`export {}`). The backend is fully implemented with inline Zod schemas and Prisma-generated types. The next milestone is building the frontend layer (`@mfe/api` query hooks, then MFE pages), which requires shared types, schemas, and constants to be in place.

Current state of schemas in the backend:
- `apps/backend/src/routes/auth.ts` — `loginSchema`, `registerSchema`
- `apps/backend/src/routes/cart.ts` — `addItemSchema`, `updateItemSchema`
- `apps/backend/src/routes/products.ts` — `querySchema` (product filters + pagination)
- `apps/backend/src/routes/orders.ts` — `orderIdSchema` (param validation only, stays in backend)

## Goals / Non-Goals

**Goals:**
- Establish `@mfe/shared` as the single source of truth for API-contract types and validation schemas
- Enable `z.infer<typeof schema>` pattern for both frontend forms (zodResolver) and backend validation
- Provide constants that eliminate magic strings across MFEs
- Keep the package lightweight — no React dependency, no runtime beyond Zod

**Non-Goals:**
- Re-exporting Prisma-generated types (they contain internal fields like `password`)
- Creating a "God package" — only genuinely shared things live here
- Runtime API logic (that's `@mfe/api`'s job)
- UI utilities that depend on React (those go in `@mfe/ui`)

## Decisions

### Decision 1: API-contract types are manually defined, not derived from Prisma

```
┌─────────────────────────────────────────────────────────────┐
│  Prisma Schema (DB)          API Contract (@mfe/shared)     │
├─────────────────────────────────────────────────────────────┤
│  User {                      SafeUser {                     │
│    id, email, name,            id, email, name,             │
│    password, ← EXCLUDED        createdAt                    │
│    createdAt, updatedAt      }                              │
│  }                                                          │
├─────────────────────────────────────────────────────────────┤
│  Product {                   Product {                      │
│    id, name, description,      id, name, description,      │
│    price, image, category,     price, image, category,      │
│    stock, createdAt,           stock, createdAt             │
│    cartItems, orderItems     }                              │
│    ← relations EXCLUDED                                     │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

**Rationale**: Decouples the frontend from database internals. If a column is added to the DB, the API contract doesn't change unless explicitly updated. Prisma types include relation fields, internal timestamps, and sensitive data — none of which belong on the wire.

**Alternative considered**: Auto-generating types from Prisma with field exclusions. Rejected because it creates tight coupling and requires a build step to sync.

### Decision 2: Schemas use Zod and export inferred types alongside

```typescript
// packages/shared/src/schemas/auth.ts
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

**Rationale** (per ADR-008): Single schema definition used for:
1. Frontend form validation via `zodResolver(loginSchema)`
2. Backend request validation via `validate(loginSchema)` middleware
3. TypeScript types via `z.infer<>` — no manual type/schema drift

**Alternative considered**: Separate type definitions + separate validation. Rejected because it doubles maintenance and allows drift between type and runtime check.

### Decision 3: File structure uses domain-based organization

```
packages/shared/src/
├── types/
│   ├── user.ts          ← SafeUser, AuthResponse
│   ├── product.ts       ← Product, ProductListResponse, PaginatedResponse<T>
│   ├── cart.ts          ← CartItem, CartResponse
│   ├── order.ts         ← OrderSummary, OrderDetail, OrderItem
│   ├── api.ts           ← ApiError, ApiSuccessResponse (generic wrappers)
│   └── index.ts         ← barrel re-export
├── schemas/
│   ├── auth.ts          ← loginSchema, registerSchema + inferred types
│   ├── cart.ts          ← addToCartSchema, updateCartItemSchema + inferred types
│   ├── product.ts       ← productFilterSchema + inferred type
│   └── index.ts         ← barrel re-export
├── constants.ts         ← API_BASE_URL, ROUTES, pagination defaults
├── utils.ts             ← formatCurrency, cn()
└── index.ts             ← top-level barrel
```

**Rationale**: Mirrors the domain boundaries already established in backend routes. Each domain file is independently importable for tree-shaking. Barrel files enable convenient `import { SafeUser, loginSchema } from "@mfe/shared"`.

### Decision 4: Generic `PaginatedResponse<T>` type for list endpoints

```typescript
export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
```

**Rationale** (per typescript-advanced-types generic pattern): The products endpoint already returns this shape. Using a generic allows `@mfe/api` query hooks to type list responses consistently: `PaginatedResponse<Product>`.

### Decision 5: `cn()` lives in `@mfe/shared`, not `@mfe/ui`

**Rationale**: `cn()` is just `clsx` + `twMerge` — a pure string utility with no React dependency. Placing it in `@mfe/shared` means both `@mfe/ui` components and MFE app code can use it without importing the full UI package. `@mfe/ui` will re-export it for convenience.

**Alternative considered**: Keep `cn()` in `@mfe/ui` only. Rejected because MFE apps need `cn()` for local component styling without pulling in the entire UI package.

### Decision 6: Backend imports schemas from `@mfe/shared`

```
┌──────────────┐     imports schemas     ┌──────────────┐
│ apps/backend │◀────────────────────────│ @mfe/shared  │
│ routes/*.ts  │                          │ schemas/*.ts │
└──────────────┘                          └──────────────┘
        │                                        ▲
        │                                        │
        └── @mfe/shared added to ────────────────┘
            backend package.json deps
```

**Rationale**: Makes backend a consumer of the shared contract, not the owner. The `validate()` middleware already accepts any `ZodSchema` — no changes needed there. Only route files change their import source.

**`orderIdSchema` stays in backend**: It's purely a request-param validation (`z.string().uuid()`), never used by frontend forms.

### Decision 7: Constants use object namespacing, not flat exports

```typescript
export const API_BASE_URL = "http://localhost:3003";

export const ROUTES = {
  AUTH: { LOGIN: "/auth/login", REGISTER: "/auth/register", LOGOUT: "/auth/logout", ME: "/auth/me" },
  PRODUCTS: { LIST: "/api/products", DETAIL: (id: string) => `/api/products/${id}` },
  CART: { GET: "/api/cart", ITEMS: "/api/cart/items", ITEM: (id: string) => `/api/cart/items/${id}` },
  ORDERS: { LIST: "/api/orders", DETAIL: (id: string) => `/api/orders/${id}`, CREATE: "/api/orders" },
} as const;
```

**Rationale**: Namespaced under domain makes autocomplete discoverable (`ROUTES.CART.` shows all cart endpoints). The `as const` assertion enables literal type narrowing. Function entries for parameterized routes prevent string interpolation bugs.

## Data Flow (after this change)

```
┌────────────────────────────────────────────────────────────────────┐
│                         @mfe/shared                                 │
│                                                                    │
│  ┌─────────┐   ┌──────────┐   ┌───────────┐   ┌───────────┐      │
│  │  types/ │   │ schemas/ │   │ constants │   │  utils    │      │
│  └────┬────┘   └────┬─────┘   └─────┬─────┘   └─────┬─────┘      │
│       │              │               │               │             │
└───────┼──────────────┼───────────────┼───────────────┼─────────────┘
        │              │               │               │
        ▼              ▼               ▼               ▼
  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
  │ @mfe/api │   │ backend  │   │ @mfe/api │   │ @mfe/ui  │
  │ (hooks   │   │ (validate│   │ (baseURL,│   │ (cn()    │
  │  return  │   │  req.body│   │  routes) │   │  helper) │
  │  types)  │   │  w/schema│   │          │   │          │
  └──────────┘   └──────────┘   └──────────┘   └──────────┘
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Types drift from actual API responses over time | Backend tests validate response shapes; future: add contract tests |
| `zod` added as dependency increases bundle for `@mfe/shared` consumers | Zod is ~13KB gzipped, already needed for forms (zodResolver). Tree-shaking: consumers only importing types get zero runtime cost since `z.infer` is compile-time only |
| Backend now depends on `@mfe/shared` creating a build-order constraint | Already declared in Turborepo `^build` graph — `@mfe/shared` builds before `apps/backend` |
| `cn()` pulls in `clsx` + `tailwind-merge` as deps of `@mfe/shared` | These are tiny (clsx ~228B, twMerge ~6KB). Every frontend consumer needs them anyway |

## Open Questions

- **None blocking** — all decisions align with existing ADRs and the established architecture. Proceed to implementation.
