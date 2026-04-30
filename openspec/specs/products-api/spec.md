## ADDED Requirements

### Requirement: GET /api/products returns a paginated list of products
The `GET /api/products` endpoint SHALL return a JSON response containing an array of products and pagination metadata. It SHALL NOT require authentication. The response envelope SHALL have the shape `{ data: Product[], pagination: { page, limit, total, totalPages } }`.

#### Scenario: Default request with no query params
- **WHEN** a GET request is made to `/api/products` with no query parameters
- **THEN** the response status is 200
- **THEN** `data` contains up to 12 products (default limit)
- **THEN** `pagination.page` is 1
- **THEN** `pagination.limit` is 12
- **THEN** `pagination.total` is the total count of all products in the database
- **THEN** `pagination.totalPages` equals `Math.ceil(total / limit)`

#### Scenario: Pagination with page and limit
- **WHEN** a GET request is made to `/api/products?page=2&limit=4`
- **THEN** `data` contains up to 4 products starting from offset `(2-1)*4 = 4`
- **THEN** `pagination.page` is 2
- **THEN** `pagination.limit` is 4

#### Scenario: Page beyond total range returns empty data
- **WHEN** a GET request is made to `/api/products?page=999`
- **THEN** the response status is 200
- **THEN** `data` is an empty array
- **THEN** `pagination.page` is 999
- **THEN** `pagination.total` reflects the actual total count

### Requirement: GET /api/products supports text search via ?search param
The endpoint SHALL filter products where the `name` OR `description` fields contain the search keyword (case-insensitive substring match).

#### Scenario: Search matches product name
- **WHEN** a GET request is made to `/api/products?search=phone`
- **THEN** `data` contains only products whose `name` or `description` contains "phone" (case-insensitive)
- **THEN** `pagination.total` reflects the filtered count

#### Scenario: Search with no matches
- **WHEN** a GET request is made to `/api/products?search=nonexistentkeyword123`
- **THEN** `data` is an empty array
- **THEN** `pagination.total` is 0

### Requirement: GET /api/products supports category filtering via ?category param
The endpoint SHALL filter products by exact match on the `category` field when the `?category` query parameter is provided.

#### Scenario: Filter by existing category
- **WHEN** a GET request is made to `/api/products?category=electronics`
- **THEN** `data` contains only products where `category` equals "electronics"
- **THEN** `pagination.total` reflects the filtered count

#### Scenario: Filter by non-existent category
- **WHEN** a GET request is made to `/api/products?category=nonexistent`
- **THEN** `data` is an empty array
- **THEN** `pagination.total` is 0

#### Scenario: Search and category combined
- **WHEN** a GET request is made to `/api/products?search=pro&category=electronics`
- **THEN** `data` contains only products matching BOTH the search term AND the category

### Requirement: GET /api/products supports sorting via ?sort param
The endpoint SHALL support sorting products by the `sort` query parameter. Valid sort values are: `price_asc`, `price_desc`, `name_asc`, `newest`. Default sort order (when no `sort` param provided) SHALL be `newest` (descending `createdAt`).

#### Scenario: Sort by price ascending
- **WHEN** a GET request is made to `/api/products?sort=price_asc`
- **THEN** `data` is ordered by `price` ascending (lowest first)

#### Scenario: Sort by price descending
- **WHEN** a GET request is made to `/api/products?sort=price_desc`
- **THEN** `data` is ordered by `price` descending (highest first)

#### Scenario: Sort by name ascending
- **WHEN** a GET request is made to `/api/products?sort=name_asc`
- **THEN** `data` is ordered by `name` alphabetically (A–Z)

#### Scenario: Sort by newest (default)
- **WHEN** a GET request is made to `/api/products` with no `sort` param
- **THEN** `data` is ordered by `createdAt` descending (newest first)

#### Scenario: Invalid sort value uses default
- **WHEN** a GET request is made to `/api/products?sort=invalid_value`
- **THEN** `data` is ordered by `createdAt` descending (default sort)

### Requirement: GET /api/products validates and coerces query parameters with Zod
The endpoint SHALL validate query parameters using a Zod schema. Invalid numeric values for `page` and `limit` SHALL fall back to defaults (page=1, limit=12). The `limit` parameter SHALL be capped at 100.

#### Scenario: Non-numeric page falls back to default
- **WHEN** a GET request is made to `/api/products?page=abc`
- **THEN** the response uses page=1 (default)

#### Scenario: Limit exceeding maximum is capped
- **WHEN** a GET request is made to `/api/products?limit=500`
- **THEN** the response uses limit=100 (maximum cap)

#### Scenario: Negative page falls back to default
- **WHEN** a GET request is made to `/api/products?page=-1`
- **THEN** the response uses page=1 (default)

### Requirement: GET /api/products/:id returns a single product
The `GET /api/products/:id` endpoint SHALL return a single product object (unwrapped, no envelope) when a valid product ID is provided. It SHALL NOT require authentication.

#### Scenario: Valid product ID
- **WHEN** a GET request is made to `/api/products/:id` with a valid existing product ID
- **THEN** the response status is 200
- **THEN** the response body is a JSON object with fields: `id`, `name`, `description`, `price`, `image`, `category`, `stock`, `createdAt`

#### Scenario: Non-existent product ID
- **WHEN** a GET request is made to `/api/products/:id` with an ID that does not exist
- **THEN** the response status is 404
- **THEN** the response body is `{ "error": "Product not found" }`

### Requirement: Product response shape includes all model fields
Each product object in API responses SHALL include: `id` (string UUID), `name` (string), `description` (string), `price` (integer, cents), `image` (string URL), `category` (string), `stock` (integer), `createdAt` (string, ISO 8601 format).

#### Scenario: Product object has correct field types
- **WHEN** inspecting a product object in any API response
- **THEN** `id` is a string in UUID format
- **THEN** `price` is an integer representing cents (e.g., 1999 for $19.99)
- **THEN** `stock` is a non-negative integer
- **THEN** `createdAt` is an ISO 8601 date string

### Requirement: Products router is mounted at /api/products in Express app
The `apps/backend/src/index.ts` entry point SHALL import and mount the products router at the `/api/products` path.

#### Scenario: Router is registered
- **WHEN** inspecting `apps/backend/src/index.ts`
- **THEN** it imports from `"./routes/products"` and registers with `app.use("/api/products", productsRouter)`

#### Scenario: Products routes are accessible
- **WHEN** the backend server is running
- **THEN** `GET /api/products` and `GET /api/products/:id` respond (not 404 from Express)

### Requirement: Products endpoint does not require authentication
Both `GET /api/products` and `GET /api/products/:id` SHALL be publicly accessible without any authentication token or cookie.

#### Scenario: Unauthenticated request succeeds
- **WHEN** a GET request is made to `/api/products` without any authentication cookie
- **THEN** the response status is 200 (not 401 or 403)

#### Scenario: No auth middleware on products routes
- **WHEN** inspecting `apps/backend/src/routes/products.ts`
- **THEN** the route handlers do NOT use the `auth` middleware
