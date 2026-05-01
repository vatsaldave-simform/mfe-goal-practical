## 1. Package Setup

> **Skills to load**: turborepo

- [x] 1.1 Add `zod`, `clsx`, and `tailwind-merge` as runtime dependencies in `packages/shared/package.json`
- [x] 1.2 Add `@mfe/shared: "workspace:*"` to `apps/backend/package.json` dependencies (if not already present)
- [x] 1.3 Run `pnpm install` to update the lockfile

## 2. Types

> **Skills to load**: typescript-advanced-types

- [x] 2.1 Create `packages/shared/src/types/api.ts` — export `ApiError` type (`{ error: string; details?: Record<string, string[]> }`) and `ApiSuccessMessage` type (`{ message: string }`)
- [x] 2.2 Create `packages/shared/src/types/user.ts` — export `SafeUser` type (`{ id, email, name, createdAt: string }`) and `AuthResponse` type (`{ user: SafeUser }`)
- [x] 2.3 Create `packages/shared/src/types/product.ts` — export `Product` type, generic `PaginatedResponse<T>` type, and `ProductListResponse` alias (`PaginatedResponse<Product>`)
- [x] 2.4 Create `packages/shared/src/types/cart.ts` — export `CartItemProduct`, `CartItem`, and `CartResponse` types
- [x] 2.5 Create `packages/shared/src/types/order.ts` — export `OrderItem`, `OrderSummary`, and `OrderDetail` types
- [x] 2.6 Create `packages/shared/src/types/index.ts` — barrel re-export all types from domain files

## 3. Schemas

> **Skills to load**: typescript-advanced-types

- [x] 3.1 Create `packages/shared/src/schemas/auth.ts` — export `loginSchema`, `registerSchema`, and inferred types `LoginInput`, `RegisterInput`
- [x] 3.2 Create `packages/shared/src/schemas/cart.ts` — export `addToCartSchema`, `updateCartItemSchema`, and inferred types `AddToCartInput`, `UpdateCartItemInput`
- [x] 3.3 Create `packages/shared/src/schemas/product.ts` — export `productFilterSchema` and inferred type `ProductFilterInput`
- [x] 3.4 Create `packages/shared/src/schemas/index.ts` — barrel re-export all schemas and inferred types

## 4. Constants & Utils

> **Skills to load**: typescript-advanced-types

- [x] 4.1 Create `packages/shared/src/constants.ts` — export `API_BASE_URL`, `ROUTES` (namespaced with `as const`), `DEFAULT_PAGE_SIZE`, and `MAX_PAGE_SIZE`
- [x] 4.2 Create `packages/shared/src/utils.ts` — export `formatCurrency` (integer cents → formatted USD string) and `cn` (clsx + twMerge)

## 5. Barrel Export

> **Skills to load**: turborepo

- [x] 5.1 Update `packages/shared/src/index.ts` — replace placeholder with re-exports from `./types`, `./schemas`, `./constants`, and `./utils`

## 6. Backend Refactor

> **Skills to load**: turborepo

- [x] 6.1 Refactor `apps/backend/src/routes/auth.ts` — remove inline `loginSchema` and `registerSchema`, import from `@mfe/shared`
- [x] 6.2 Refactor `apps/backend/src/routes/cart.ts` — remove inline `addItemSchema` and `updateItemSchema`, import `addToCartSchema` and `updateCartItemSchema` from `@mfe/shared`
- [x] 6.3 Refactor `apps/backend/src/routes/products.ts` — remove inline `querySchema`, import `productFilterSchema` from `@mfe/shared`

## 7. Verification

- [x] 7.1 Run `pnpm turbo run build --filter=@mfe/shared` and confirm zero errors
- [x] 7.2 Run `pnpm turbo run build --filter=@mfe/backend` and confirm zero errors (backend imports from shared successfully)
- [x] 7.3 Run `pnpm turbo run build` across the full workspace and confirm no regressions
