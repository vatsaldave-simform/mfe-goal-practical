## MODIFIED Requirements

### Requirement: @mfe/shared is a buildable package scaffold
The `packages/shared` package SHALL be a buildable TypeScript package that compiles `src/` to `dist/` using `tsc`, with `zod`, `clsx`, and `tailwind-merge` as runtime dependencies.

#### Scenario: Package compiles successfully
- **WHEN** the developer runs `turbo run build` and the build reaches `@mfe/shared`
- **THEN** `tsc` compiles all files under `src/` (including `types/`, `schemas/`, `constants.ts`, `utils.ts`) into `dist/` with zero errors

#### Scenario: Package exports are configured correctly
- **WHEN** another package declares `"@mfe/shared": "workspace:*"` as a dependency
- **THEN** the consuming package resolves the import through `main: "./dist/index.js"` and `types: "./dist/index.d.ts"` as declared in `package.json` exports

#### Scenario: Package extends shared TypeScript config
- **WHEN** inspecting `packages/shared/tsconfig.json`
- **THEN** it extends `@mfe/tsconfig/react.json` and declares `outDir: "./dist"` and `include: ["src"]`

#### Scenario: Package declares runtime dependencies
- **WHEN** inspecting `packages/shared/package.json`
- **THEN** it lists `"zod"`, `"clsx"`, and `"tailwind-merge"` in its `dependencies` field

#### Scenario: Backend declares @mfe/shared as a workspace dependency
- **WHEN** inspecting `apps/backend/package.json`
- **THEN** it lists `"@mfe/shared": "workspace:*"` in its `dependencies` so route files can import shared schemas

#### Scenario: Backend route files import schemas from @mfe/shared
- **WHEN** inspecting `apps/backend/src/routes/auth.ts`, `cart.ts`, and `products.ts`
- **THEN** each imports its validation schemas from `@mfe/shared` instead of defining them inline
