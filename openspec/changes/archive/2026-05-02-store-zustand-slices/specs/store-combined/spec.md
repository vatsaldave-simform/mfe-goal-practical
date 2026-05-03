## ADDED Requirements

### Requirement: Combined store merges auth and cart slices
The store SHALL be created using Zustand's `create` function combining both `AuthSlice` and `CartSlice` into a single `StoreState` type.

#### Scenario: Store contains both slice fields
- **WHEN** the store is created
- **THEN** the store state SHALL include all fields from `AuthSlice` (`isAuthenticated`, `user`, `setAuth`, `clearAuth`) and `CartSlice` (`itemCount`, `setCartCount`, `clearCart`)

### Requirement: useStore hook is exported
The package SHALL export a `useStore` hook that provides typed access to the combined store via Zustand's `useStore` / bound store pattern.

#### Scenario: Consuming useStore in a component
- **WHEN** a React component imports `useStore` from `@mfe/store`
- **THEN** it SHALL be able to select any field (`useStore(s => s.isAuthenticated)`) with full TypeScript type inference

### Requirement: Store types are exported
The package SHALL export the `StoreState`, `AuthSlice`, and `CartSlice` types from its barrel `index.ts`.

#### Scenario: Importing types from @mfe/store
- **WHEN** a consumer imports `{ StoreState, AuthSlice, CartSlice }` from `@mfe/store`
- **THEN** the import SHALL resolve without TypeScript errors

### Requirement: Package declares zustand as dependency
The `@mfe/store` `package.json` SHALL list `zustand` as a runtime dependency.

#### Scenario: Zustand in dependencies
- **WHEN** inspecting `packages/store/package.json`
- **THEN** `zustand` SHALL appear in `dependencies` (not only `devDependencies` or `peerDependencies`)

### Requirement: Package builds without errors
The `@mfe/store` package SHALL compile successfully via `tsc --project tsconfig.json` with no errors.

#### Scenario: Clean build
- **WHEN** running `pnpm --filter @mfe/store run build`
- **THEN** the command SHALL exit with code 0 and produce `dist/` output
