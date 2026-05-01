## Why

The `@mfe/shared` package is an empty placeholder scaffold. All three frontend MFEs (host, storefront, account) and the backend need a single source of truth for API contract types, validation schemas, and shared constants. Currently, Zod schemas like `loginSchema` and `registerSchema` are defined inline in backend route files — duplicating these when frontend forms need identical validation is error-prone. Populating `@mfe/shared` now unblocks the `@mfe/api` query hooks layer and frontend form development.

## What Changes

- Add **API-contract types** (`SafeUser`, `Product`, `CartItem`, `CartResponse`, `OrderSummary`, `OrderDetail`, `PaginatedResponse`, `ApiError`) to `packages/shared/src/types/`
- Add **Zod validation schemas** (`loginSchema`, `registerSchema`, `addToCartSchema`, `updateCartItemSchema`, `productFilterSchema`) to `packages/shared/src/schemas/` — these are moved from backend route files
- Add **constants** (`API_BASE_URL`, route path constants) to `packages/shared/src/constants.ts`
- Add **utility functions** (`formatCurrency`, `cn()`) to `packages/shared/src/utils.ts`
- **Refactor backend** to import shared schemas from `@mfe/shared` instead of defining them inline
- Add `zod` as a dependency of `@mfe/shared`
- Update `packages/shared/src/index.ts` barrel to re-export all modules

## Capabilities

### New Capabilities
- `shared-types`: API-contract type definitions (request/response shapes) shared between frontend and backend — decoupled from Prisma models
- `shared-schemas`: Zod validation schemas as single source of truth for both client-side form validation and server-side request validation
- `shared-constants`: Centralized API URL, route paths, and app-wide constants
- `shared-utils`: Utility functions (`formatCurrency`, `cn()`) used across MFEs

### Modified Capabilities
- `package-scaffolds`: `@mfe/shared` transitions from empty placeholder to populated package with real exports and a `zod` dependency

## Impact

- **`packages/shared/`** — New files: `src/types/`, `src/schemas/`, `src/constants.ts`, `src/utils.ts`; updated `package.json` (adds `zod` dep), updated `src/index.ts`
- **`apps/backend/src/routes/auth.ts`** — Remove inline `loginSchema`/`registerSchema`, import from `@mfe/shared`
- **`apps/backend/src/routes/cart.ts`** — Remove inline `addItemSchema`/`updateItemSchema`, import from `@mfe/shared`
- **`apps/backend/src/routes/products.ts`** — Remove inline `querySchema`, import from `@mfe/shared`
- **`apps/backend/package.json`** — Add `@mfe/shared: "workspace:*"` dependency (if not already present)
- **Consumers** — `@mfe/api` (next change) and all MFE apps will import types/schemas from `@mfe/shared`

## Non-goals

- Defining Prisma model types or re-exporting generated Prisma types (those stay in `apps/backend/generated/`)
- Creating the `@mfe/api` query hooks layer (separate change)
- Populating `@mfe/store` Zustand slices (separate change)
- Adding shadcn components or styling utilities to `@mfe/ui` (separate change)
- Form component implementations (MFE-specific, not shared)

## Skills

- **turborepo** — workspace dependency graph, build ordering
- **typescript-advanced-types** — type definitions, `z.infer<>` patterns, generic response types

## Relevant ADRs

- **ADR-008**: Zod schemas live in `packages/shared/src/schemas/` (single source of truth for client + server validation)
- **ADR-006**: `@mfe/api` imports types from `@mfe/shared` for end-to-end type safety
- **ADR-002**: Types here define the API contract shapes used by TanStack Query, not Zustand state
