## ADDED Requirements

### Requirement: API_BASE_URL constant provides the backend server origin
The `packages/shared/src/constants.ts` module SHALL export an `API_BASE_URL` constant with the default backend URL.

#### Scenario: API_BASE_URL points to the backend dev server
- **WHEN** a consumer imports `API_BASE_URL` from `@mfe/shared`
- **THEN** the value is `"http://localhost:3003"`

### Requirement: ROUTES constant provides namespaced API endpoint paths
The `packages/shared/src/constants.ts` module SHALL export a `ROUTES` constant object with endpoint paths organized by domain.

#### Scenario: AUTH routes are correctly defined
- **WHEN** a consumer accesses `ROUTES.AUTH`
- **THEN** it contains `LOGIN: "/auth/login"`, `REGISTER: "/auth/register"`, `LOGOUT: "/auth/logout"`, and `ME: "/auth/me"`

#### Scenario: PRODUCTS routes include parameterized detail path
- **WHEN** a consumer accesses `ROUTES.PRODUCTS`
- **THEN** it contains `LIST: "/api/products"` and `DETAIL` as a function that accepts an `id` string and returns `"/api/products/${id}"`

#### Scenario: CART routes include parameterized item path
- **WHEN** a consumer accesses `ROUTES.CART`
- **THEN** it contains `GET: "/api/cart"`, `ITEMS: "/api/cart/items"`, and `ITEM` as a function that accepts an `id` string and returns `"/api/cart/items/${id}"`

#### Scenario: ORDERS routes include parameterized detail path
- **WHEN** a consumer accesses `ROUTES.ORDERS`
- **THEN** it contains `LIST: "/api/orders"`, `CREATE: "/api/orders"`, and `DETAIL` as a function that accepts an `id` string and returns `"/api/orders/${id}"`

#### Scenario: ROUTES is declared as const for literal type narrowing
- **WHEN** inspecting the type of `ROUTES`
- **THEN** it uses `as const` assertion so string values are literal types, not widened to `string`

### Requirement: Pagination defaults are exported as constants
The `packages/shared/src/constants.ts` module SHALL export pagination-related default values.

#### Scenario: DEFAULT_PAGE_SIZE is defined
- **WHEN** a consumer imports `DEFAULT_PAGE_SIZE` from `@mfe/shared`
- **THEN** the value is `12` (matching the backend's default limit)

#### Scenario: MAX_PAGE_SIZE is defined
- **WHEN** a consumer imports `MAX_PAGE_SIZE` from `@mfe/shared`
- **THEN** the value is `100` (matching the backend's maximum limit)
