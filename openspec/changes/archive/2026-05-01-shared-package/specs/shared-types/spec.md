## ADDED Requirements

### Requirement: SafeUser type represents the authenticated user without sensitive fields
The `packages/shared/src/types/user.ts` module SHALL export a `SafeUser` type that mirrors the User database model but excludes the `password` and `updatedAt` fields.

#### Scenario: SafeUser includes only public user fields
- **WHEN** a consumer imports `SafeUser` from `@mfe/shared`
- **THEN** the type contains exactly `id: string`, `email: string`, `name: string`, and `createdAt: string`

#### Scenario: AuthResponse wraps SafeUser for login/register responses
- **WHEN** a consumer imports `AuthResponse` from `@mfe/shared`
- **THEN** the type is defined as `{ user: SafeUser }`

### Requirement: Product type represents the full product entity from the API
The `packages/shared/src/types/product.ts` module SHALL export a `Product` type matching the shape returned by `GET /api/products/:id`.

#### Scenario: Product type includes all public product fields
- **WHEN** a consumer imports `Product` from `@mfe/shared`
- **THEN** the type contains `id: string`, `name: string`, `description: string`, `price: number`, `image: string`, `category: string`, `stock: number`, and `createdAt: string`

#### Scenario: PaginatedResponse generic type wraps list endpoints
- **WHEN** a consumer imports `PaginatedResponse<T>` from `@mfe/shared`
- **THEN** the type is defined as `{ data: T[]; pagination: { page: number; limit: number; total: number; totalPages: number } }`

#### Scenario: ProductListResponse is a typed alias for paginated products
- **WHEN** a consumer imports `ProductListResponse` from `@mfe/shared`
- **THEN** it is defined as `PaginatedResponse<Product>`

### Requirement: Cart types represent the cart API response shapes
The `packages/shared/src/types/cart.ts` module SHALL export types matching the shapes returned by cart API endpoints.

#### Scenario: CartItemProduct type represents the embedded product in a cart item
- **WHEN** a consumer imports `CartItemProduct` from `@mfe/shared`
- **THEN** the type contains `id: string`, `name: string`, `price: number`, and `image: string`

#### Scenario: CartItem type represents a single item in the cart
- **WHEN** a consumer imports `CartItem` from `@mfe/shared`
- **THEN** the type contains `id: string`, `productId: string`, `quantity: number`, and `product: CartItemProduct`

#### Scenario: CartResponse represents the full cart state from GET /api/cart
- **WHEN** a consumer imports `CartResponse` from `@mfe/shared`
- **THEN** the type contains `id: string | null`, `items: CartItem[]`, `total: number`, and `itemCount: number`

### Requirement: Order types represent order API response shapes
The `packages/shared/src/types/order.ts` module SHALL export types matching the shapes returned by order API endpoints.

#### Scenario: OrderItem type represents a line item in an order
- **WHEN** a consumer imports `OrderItem` from `@mfe/shared`
- **THEN** the type contains `id: string`, `productId: string | null`, `name: string`, `price: number`, and `quantity: number`

#### Scenario: OrderSummary type represents the list view of an order
- **WHEN** a consumer imports `OrderSummary` from `@mfe/shared`
- **THEN** the type contains `id: string`, `status: string`, `total: number`, `createdAt: string`, and `itemCount: number`

#### Scenario: OrderDetail type represents a single order with its items
- **WHEN** a consumer imports `OrderDetail` from `@mfe/shared`
- **THEN** the type contains `id: string`, `userId: string`, `status: string`, `total: number`, `createdAt: string`, and `items: OrderItem[]`

### Requirement: Generic API error and success types are provided
The `packages/shared/src/types/api.ts` module SHALL export generic wrapper types for API error and success responses.

#### Scenario: ApiError type represents a standard error response
- **WHEN** a consumer imports `ApiError` from `@mfe/shared`
- **THEN** the type contains `error: string` and an optional `details: Record<string, string[]>`

#### Scenario: ApiSuccessMessage type represents a simple success response
- **WHEN** a consumer imports `ApiSuccessMessage` from `@mfe/shared`
- **THEN** the type contains `message: string`

### Requirement: Types barrel file re-exports all domain types
The `packages/shared/src/types/index.ts` module SHALL re-export all types from domain-specific type files.

#### Scenario: All types are importable from the types barrel
- **WHEN** a consumer imports from `@mfe/shared` (via the top-level barrel)
- **THEN** all types (`SafeUser`, `AuthResponse`, `Product`, `PaginatedResponse`, `ProductListResponse`, `CartItemProduct`, `CartItem`, `CartResponse`, `OrderItem`, `OrderSummary`, `OrderDetail`, `ApiError`, `ApiSuccessMessage`) are available

### Requirement: All type fields use string for Date values
All date fields in shared types SHALL use `string` (ISO 8601 format) because JSON serialization converts `Date` objects to strings over the wire.

#### Scenario: createdAt fields are typed as string
- **WHEN** inspecting any shared type that includes a `createdAt` field
- **THEN** the field is typed as `string`, not `Date`
