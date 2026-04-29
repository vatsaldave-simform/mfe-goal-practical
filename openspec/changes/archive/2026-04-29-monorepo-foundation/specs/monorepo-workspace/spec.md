## ADDED Requirements

### Requirement: pnpm workspace defines all packages and apps
The workspace SHALL declare all workspace member paths in `pnpm-workspace.yaml` so that pnpm resolves `workspace:*` dependencies across the monorepo.

#### Scenario: Workspace includes apps and packages
- **WHEN** the developer runs `pnpm install` in the repository root
- **THEN** pnpm resolves the workspace members `apps/*` and `packages/*`, installing all inter-package dependencies locally without publishing

### Requirement: Root package.json delegates to Turborepo
The root `package.json` SHALL declare scripts that delegate exclusively to `turbo run <task>` and SHALL NOT contain any direct build, lint, or typecheck commands.

#### Scenario: Build script delegates to turbo
- **WHEN** the developer runs `pnpm build` from the repository root
- **THEN** the root `package.json` executes `turbo run build`, which orchestrates the build across all workspace members respecting the dependency graph

#### Scenario: Dev script delegates to turbo
- **WHEN** the developer runs `pnpm dev` from the repository root
- **THEN** the root `package.json` executes `turbo run dev`, which starts all dev servers concurrently after building their dependencies

#### Scenario: No shorthand turbo commands
- **WHEN** inspecting root `package.json` scripts
- **THEN** every script that invokes Turborepo SHALL use `turbo run <task>` (not shorthand `turbo build` or `turbo dev`)

### Requirement: Turborepo build task cascades through dependencies
The `build` task in `turbo.json` SHALL declare `dependsOn: ["^build"]` so that upstream packages build before their downstream consumers.

#### Scenario: Shared package builds before consuming app
- **WHEN** the developer runs `turbo run build`
- **THEN** `@mfe/tsconfig` is available first, then `@mfe/shared` and `@mfe/ui` build, then `@mfe/store` and `@mfe/api` build (since they depend on `@mfe/shared`), and finally all apps build

#### Scenario: Build outputs are cached
- **WHEN** the developer runs `turbo run build` a second time with no source changes
- **THEN** Turborepo serves cached `dist/**` output for every package and app, completing in near-zero time

### Requirement: Turborepo dev task builds dependencies first
The `dev` task in `turbo.json` SHALL declare `dependsOn: ["^build"]`, `persistent: true`, and `cache: false`.

#### Scenario: Dev servers start after dependencies are built
- **WHEN** the developer runs `turbo run dev`
- **THEN** all shared packages compile first via `^build`, then each app's dev server starts as a persistent process

#### Scenario: Dev task is not cacheable
- **WHEN** inspecting the `dev` task in `turbo.json`
- **THEN** the task declares `cache: false` because dev servers are long-running processes with no deterministic output

### Requirement: Turborepo lint task runs in parallel
The `lint` task in `turbo.json` SHALL have no `dependsOn` entries, allowing it to run across all packages in parallel.

#### Scenario: Lint runs without waiting for builds
- **WHEN** the developer runs `turbo run lint`
- **THEN** all packages lint simultaneously without waiting for `^build` because linting operates on source files, not build output

### Requirement: Turborepo typecheck task depends on upstream builds
The `typecheck` task in `turbo.json` SHALL declare `dependsOn: ["^build"]` because type-checking requires `.d.ts` declaration files produced by upstream package builds.

#### Scenario: Typecheck runs after dependencies produce declarations
- **WHEN** the developer runs `turbo run typecheck`
- **THEN** upstream packages build first (producing `.d.ts` files), then each package and app type-checks against the built declarations

### Requirement: .npmrc enforces strict dependency management
The repository root SHALL include a `.npmrc` file that configures pnpm for strict dependency resolution appropriate for a monorepo.

#### Scenario: .npmrc exists at root
- **WHEN** the developer clones the repository and runs `pnpm install`
- **THEN** pnpm reads `.npmrc` from the repository root and applies the configured settings

### Requirement: .gitignore excludes build artifacts and dependencies
The repository root SHALL include a `.gitignore` file that excludes `node_modules/`, `dist/`, and other generated files from version control.

#### Scenario: Generated files are not committed
- **WHEN** the developer runs `turbo run build` and then checks `git status`
- **THEN** no files in `node_modules/` or `dist/` directories appear as untracked or modified files
