## ADDED Requirements

### Requirement: formatCurrency utility formats price integers as currency strings
The `packages/shared/src/utils.ts` module SHALL export a `formatCurrency` function that converts integer prices (in cents) to formatted currency strings.

#### Scenario: formatCurrency formats a price in cents to USD
- **WHEN** `formatCurrency(1999)` is called
- **THEN** it returns `"$19.99"`

#### Scenario: formatCurrency handles zero
- **WHEN** `formatCurrency(0)` is called
- **THEN** it returns `"$0.00"`

#### Scenario: formatCurrency handles large values
- **WHEN** `formatCurrency(100000)` is called
- **THEN** it returns `"$1,000.00"` (with thousands separator)

### Requirement: cn() utility merges Tailwind CSS class names
The `packages/shared/src/utils.ts` module SHALL export a `cn` function that merges class names using `clsx` and `tailwind-merge`.

#### Scenario: cn merges multiple class strings
- **WHEN** `cn("px-2 py-1", "px-4")` is called
- **THEN** it returns `"py-1 px-4"` (tailwind-merge resolves the `px` conflict)

#### Scenario: cn handles conditional classes
- **WHEN** `cn("base", false && "hidden", "extra")` is called
- **THEN** it returns `"base extra"` (falsy values are excluded)

#### Scenario: cn handles undefined and null inputs
- **WHEN** `cn("base", undefined, null, "extra")` is called
- **THEN** it returns `"base extra"` without errors

### Requirement: clsx and tailwind-merge are declared as dependencies
The `packages/shared/package.json` SHALL declare `clsx` and `tailwind-merge` in its `dependencies` field.

#### Scenario: clsx is a runtime dependency
- **WHEN** inspecting `packages/shared/package.json`
- **THEN** `"clsx"` appears in `dependencies`

#### Scenario: tailwind-merge is a runtime dependency
- **WHEN** inspecting `packages/shared/package.json`
- **THEN** `"tailwind-merge"` appears in `dependencies`

### Requirement: Top-level barrel re-exports all modules
The `packages/shared/src/index.ts` SHALL re-export from `./types`, `./schemas`, `./constants`, and `./utils` so consumers can use a single import path.

#### Scenario: All exports are available from the package root
- **WHEN** a consumer writes `import { SafeUser, loginSchema, API_BASE_URL, formatCurrency, cn } from "@mfe/shared"`
- **THEN** all named imports resolve successfully
