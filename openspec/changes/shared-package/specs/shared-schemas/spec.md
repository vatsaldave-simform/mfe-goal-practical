## ADDED Requirements

### Requirement: Login schema validates email and password
The `packages/shared/src/schemas/auth.ts` module SHALL export a `loginSchema` Zod object that validates login form input.

#### Scenario: loginSchema requires a valid email and non-empty password
- **WHEN** a consumer imports `loginSchema` from `@mfe/shared`
- **THEN** the schema validates an object with `email: z.string().email()` and `password: z.string().min(1)`

#### Scenario: LoginInput type is inferred from loginSchema
- **WHEN** a consumer imports `LoginInput` from `@mfe/shared`
- **THEN** it equals `z.infer<typeof loginSchema>` providing `{ email: string; password: string }`

#### Scenario: loginSchema rejects invalid email
- **WHEN** `loginSchema.safeParse({ email: "not-an-email", password: "x" })` is called
- **THEN** the result has `success: false` with a field error on `email`

### Requirement: Register schema validates email, password, and name
The `packages/shared/src/schemas/auth.ts` module SHALL export a `registerSchema` Zod object that validates registration form input.

#### Scenario: registerSchema requires email, password (min 6), and name
- **WHEN** a consumer imports `registerSchema` from `@mfe/shared`
- **THEN** the schema validates an object with `email: z.string().email()`, `password: z.string().min(6)`, and `name: z.string().min(1)`

#### Scenario: RegisterInput type is inferred from registerSchema
- **WHEN** a consumer imports `RegisterInput` from `@mfe/shared`
- **THEN** it equals `z.infer<typeof registerSchema>` providing `{ email: string; password: string; name: string }`

#### Scenario: registerSchema rejects short password
- **WHEN** `registerSchema.safeParse({ email: "a@b.com", password: "12345", name: "A" })` is called
- **THEN** the result has `success: false` with a field error on `password`

### Requirement: Add-to-cart schema validates productId and quantity
The `packages/shared/src/schemas/cart.ts` module SHALL export an `addToCartSchema` Zod object that validates the add-to-cart request body.

#### Scenario: addToCartSchema requires a UUID productId and optional quantity
- **WHEN** a consumer imports `addToCartSchema` from `@mfe/shared`
- **THEN** the schema validates `productId: z.string().uuid()` and `quantity: z.number().int().min(1).default(1)`

#### Scenario: AddToCartInput type is inferred from addToCartSchema
- **WHEN** a consumer imports `AddToCartInput` from `@mfe/shared`
- **THEN** it equals `z.infer<typeof addToCartSchema>` providing `{ productId: string; quantity: number }`

#### Scenario: addToCartSchema rejects non-UUID productId
- **WHEN** `addToCartSchema.safeParse({ productId: "not-a-uuid", quantity: 1 })` is called
- **THEN** the result has `success: false` with a field error on `productId`

### Requirement: Update cart item schema validates quantity
The `packages/shared/src/schemas/cart.ts` module SHALL export an `updateCartItemSchema` Zod object that validates the cart item update request body.

#### Scenario: updateCartItemSchema requires a positive integer quantity
- **WHEN** a consumer imports `updateCartItemSchema` from `@mfe/shared`
- **THEN** the schema validates `quantity: z.number().int().min(1)`

#### Scenario: UpdateCartItemInput type is inferred from updateCartItemSchema
- **WHEN** a consumer imports `UpdateCartItemInput` from `@mfe/shared`
- **THEN** it equals `z.infer<typeof updateCartItemSchema>` providing `{ quantity: number }`

#### Scenario: updateCartItemSchema rejects zero quantity
- **WHEN** `updateCartItemSchema.safeParse({ quantity: 0 })` is called
- **THEN** the result has `success: false` with a field error on `quantity`

### Requirement: Product filter schema validates search, category, sort, and pagination
The `packages/shared/src/schemas/product.ts` module SHALL export a `productFilterSchema` Zod object that validates product list query parameters.

#### Scenario: productFilterSchema validates optional search and category strings
- **WHEN** a consumer imports `productFilterSchema` from `@mfe/shared`
- **THEN** the schema accepts optional `search: z.string()` and `category: z.string()` fields

#### Scenario: productFilterSchema validates sort enum
- **WHEN** a consumer parses `{ sort: "price_asc" }` with `productFilterSchema`
- **THEN** parsing succeeds because `sort` accepts `"price_asc" | "price_desc" | "name_asc" | "newest"`

#### Scenario: productFilterSchema provides pagination defaults
- **WHEN** a consumer parses `{}` (empty object) with `productFilterSchema`
- **THEN** parsing succeeds and returns `{ page: 1, limit: 12 }` as defaults

#### Scenario: productFilterSchema rejects invalid sort value
- **WHEN** `productFilterSchema.safeParse({ sort: "invalid" })` is called
- **THEN** the result has `success: false` with a field error on `sort`

#### Scenario: ProductFilterInput type is inferred from productFilterSchema
- **WHEN** a consumer imports `ProductFilterInput` from `@mfe/shared`
- **THEN** it equals `z.infer<typeof productFilterSchema>`

### Requirement: Schemas barrel file re-exports all schemas and inferred types
The `packages/shared/src/schemas/index.ts` module SHALL re-export all schemas and their inferred types from domain-specific schema files.

#### Scenario: All schemas are importable from the schemas barrel
- **WHEN** a consumer imports from `@mfe/shared`
- **THEN** all schemas (`loginSchema`, `registerSchema`, `addToCartSchema`, `updateCartItemSchema`, `productFilterSchema`) and their inferred types (`LoginInput`, `RegisterInput`, `AddToCartInput`, `UpdateCartItemInput`, `ProductFilterInput`) are available

### Requirement: Zod is declared as a dependency of @mfe/shared
The `packages/shared/package.json` SHALL declare `zod` in its `dependencies` field.

#### Scenario: zod is a runtime dependency
- **WHEN** inspecting `packages/shared/package.json`
- **THEN** `"zod"` appears in `dependencies` (not `devDependencies`) because schemas are used at runtime for validation
