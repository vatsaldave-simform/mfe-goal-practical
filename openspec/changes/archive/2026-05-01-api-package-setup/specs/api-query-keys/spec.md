## ADDED Requirements

### Requirement: @mfe/api exports a productKeys factory
The `@mfe/api` package SHALL export a `productKeys` object from `src/keys.ts` that produces hierarchical, array-based query keys for the products domain.

#### Scenario: productKeys.all returns the root key
- **WHEN** code accesses `productKeys.all`
- **THEN** the value SHALL be `["products"]` (a readonly tuple)

#### Scenario: productKeys.lists returns the list-level key
- **WHEN** code calls `productKeys.lists()`
- **THEN** the value SHALL be `["products", "list"]`

#### Scenario: productKeys.list includes filter parameters
- **WHEN** code calls `productKeys.list(filters)` with a `ProductFilterInput` object
- **THEN** the value SHALL be `["products", "list", filters]` where `filters` is the serializable filter object

#### Scenario: productKeys.details returns the detail-level key
- **WHEN** code calls `productKeys.details()`
- **THEN** the value SHALL be `["products", "detail"]`

#### Scenario: productKeys.detail includes the product ID
- **WHEN** code calls `productKeys.detail(id)` with a product ID string
- **THEN** the value SHALL be `["products", "detail", id]`

### Requirement: @mfe/api exports a cartKeys factory
The `@mfe/api` package SHALL export a `cartKeys` object from `src/keys.ts` that produces hierarchical query keys for the cart domain.

#### Scenario: cartKeys.all returns the root key
- **WHEN** code accesses `cartKeys.all`
- **THEN** the value SHALL be `["cart"]` (a readonly tuple)

#### Scenario: cartKeys.detail returns the cart detail key
- **WHEN** code calls `cartKeys.detail()`
- **THEN** the value SHALL be `["cart", "detail"]`

### Requirement: @mfe/api exports an orderKeys factory
The `@mfe/api` package SHALL export an `orderKeys` object from `src/keys.ts` that produces hierarchical query keys for the orders domain.

#### Scenario: orderKeys.all returns the root key
- **WHEN** code accesses `orderKeys.all`
- **THEN** the value SHALL be `["orders"]` (a readonly tuple)

#### Scenario: orderKeys.lists returns the list-level key
- **WHEN** code calls `orderKeys.lists()`
- **THEN** the value SHALL be `["orders", "list"]`

#### Scenario: orderKeys.list returns the list query key
- **WHEN** code calls `orderKeys.list()`
- **THEN** the value SHALL be `["orders", "list"]`

#### Scenario: orderKeys.details returns the detail-level key
- **WHEN** code calls `orderKeys.details()`
- **THEN** the value SHALL be `["orders", "detail"]`

#### Scenario: orderKeys.detail includes the order ID
- **WHEN** code calls `orderKeys.detail(id)` with an order ID string
- **THEN** the value SHALL be `["orders", "detail", id]`

### Requirement: @mfe/api exports an authKeys factory
The `@mfe/api` package SHALL export an `authKeys` object from `src/keys.ts` that produces hierarchical query keys for the auth domain.

#### Scenario: authKeys.all returns the root key
- **WHEN** code accesses `authKeys.all`
- **THEN** the value SHALL be `["auth"]` (a readonly tuple)

#### Scenario: authKeys.me returns the current-user key
- **WHEN** code calls `authKeys.me()`
- **THEN** the value SHALL be `["auth", "me"]`

### Requirement: All query keys use readonly array tuples
Every key factory property and method SHALL return a `readonly` array (using `as const`) so that TypeScript enforces exact key types and prevents accidental mutation.

#### Scenario: Key arrays are typed as readonly tuples
- **WHEN** a developer hovers over any key factory return value in their IDE
- **THEN** the inferred type SHALL be a `readonly` tuple type (e.g., `readonly ["products", "list", ProductFilterInput]`), not a mutable `string[]`

#### Scenario: Keys are hierarchical for partial invalidation
- **WHEN** code calls `queryClient.invalidateQueries({ queryKey: productKeys.all })`
- **THEN** TanStack Query SHALL match and invalidate all queries whose key starts with `["products"]`, including list and detail queries

### Requirement: @mfe/api barrel re-exports all key factories
The `src/index.ts` barrel SHALL re-export `productKeys`, `cartKeys`, `orderKeys`, and `authKeys` so consumers import from `@mfe/api` directly.

#### Scenario: Importing key factories from @mfe/api
- **WHEN** a consumer writes `import { productKeys, cartKeys } from "@mfe/api"`
- **THEN** the import SHALL resolve successfully through the barrel `src/index.ts`
