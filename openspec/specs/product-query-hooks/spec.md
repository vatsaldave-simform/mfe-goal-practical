## ADDED Requirements

### Requirement: @mfe/api exports a useProducts query hook
The `@mfe/api` package SHALL export a `useProducts` hook from `src/queries/products.ts` that fetches a paginated, filterable list of products.

#### Scenario: useProducts fetches products with default filters
- **WHEN** a component calls `useProducts()` with no arguments
- **THEN** the hook SHALL call `apiClient.get(ROUTES.PRODUCTS.LIST)` with no query params
- **AND** the hook SHALL use `productKeys.list({})` as the query key
- **AND** the hook SHALL return a `UseQueryResult<ProductListResponse>`

#### Scenario: useProducts passes filter parameters as query params
- **WHEN** a component calls `useProducts({ search: "shirt", category: "clothing", page: 2, limit: 12 })`
- **THEN** the hook SHALL pass the filters object as `params` to `apiClient.get(ROUTES.PRODUCTS.LIST, { params: filters })`
- **AND** the hook SHALL use `productKeys.list(filters)` as the query key so the cache is filter-specific

#### Scenario: useProducts includes filter variables in the query key
- **WHEN** a component calls `useProducts(filtersA)` and later calls `useProducts(filtersB)` with different filters
- **THEN** each call SHALL produce a distinct cache entry because the query key includes the filters object

#### Scenario: useProducts accepts option overrides
- **WHEN** a component calls `useProducts(filters, { enabled: false })`
- **THEN** the hook SHALL forward the `enabled: false` option to `useQuery`
- **AND** the hook SHALL NOT allow overriding `queryKey` or `queryFn` (these keys SHALL be omitted from the options type)

### Requirement: @mfe/api exports a useProduct query hook
The `@mfe/api` package SHALL export a `useProduct` hook from `src/queries/products.ts` that fetches a single product by ID.

#### Scenario: useProduct fetches a product by ID
- **WHEN** a component calls `useProduct("abc-123")`
- **THEN** the hook SHALL call `apiClient.get(ROUTES.PRODUCTS.DETAIL("abc-123"))`
- **AND** the hook SHALL use `productKeys.detail("abc-123")` as the query key
- **AND** the hook SHALL return a `UseQueryResult<Product>`

#### Scenario: useProduct accepts option overrides
- **WHEN** a component calls `useProduct(id, { staleTime: 300_000 })`
- **THEN** the hook SHALL forward the `staleTime` option to `useQuery`
- **AND** the hook SHALL NOT allow overriding `queryKey` or `queryFn`

### Requirement: Product query hooks use apiClient for all HTTP requests
All product query hooks SHALL use the shared `apiClient` instance from `@mfe/api/client` for HTTP requests rather than importing axios directly.

#### Scenario: useProducts uses apiClient
- **WHEN** `useProducts` executes its query function
- **THEN** it SHALL call `apiClient.get()` (not `axios.get()` or `fetch()`)

#### Scenario: useProduct uses apiClient
- **WHEN** `useProduct` executes its query function
- **THEN** it SHALL call `apiClient.get()` (not `axios.get()` or `fetch()`)

### Requirement: Product query hooks use route constants from @mfe/shared
All product query hooks SHALL use `ROUTES.PRODUCTS.*` constants from `@mfe/shared` for endpoint URLs rather than hardcoded strings.

#### Scenario: useProducts uses ROUTES.PRODUCTS.LIST
- **WHEN** `useProducts` builds its request URL
- **THEN** it SHALL use `ROUTES.PRODUCTS.LIST` (value: `"/api/products"`)

#### Scenario: useProduct uses ROUTES.PRODUCTS.DETAIL
- **WHEN** `useProduct` builds its request URL for product ID `"abc-123"`
- **THEN** it SHALL use `ROUTES.PRODUCTS.DETAIL("abc-123")` (value: `"/api/products/abc-123"`)

### Requirement: Product query hooks are re-exported from @mfe/api
The `useProducts` and `useProduct` hooks SHALL be importable from the `@mfe/api` package entry point.

#### Scenario: Hooks are accessible from the package entry point
- **WHEN** a consumer writes `import { useProducts, useProduct } from "@mfe/api"`
- **THEN** the import SHALL resolve successfully because `src/queries/products.ts` is re-exported through `src/queries/index.ts` and `src/index.ts`
