## 1. Root Monorepo Configuration

> **Skills to load**: `turborepo`

- [x] 1.1 Create `pnpm-workspace.yaml` at repo root declaring `apps/*` and `packages/*` as workspace members
- [x] 1.2 Create root `package.json` (`"name": "mfe-goal-practical"`, `private: true`) with scripts that delegate exclusively to `turbo run <task>` (`build`, `dev`, `lint`, `typecheck`)
- [x] 1.3 Create `turbo.json` with four tasks — `build` (`dependsOn: ["^build"]`, `outputs: ["dist/**"]`), `dev` (`dependsOn: ["^build"]`, `persistent: true`, `cache: false`), `lint` (no `dependsOn`), `typecheck` (`dependsOn: ["^build"]`)
- [x] 1.4 Create `.npmrc` at repo root with strict pnpm settings for monorepo use
- [x] 1.5 Create `.gitignore` at repo root excluding `node_modules/`, `dist/`, `.turbo/`, and other generated files

## 2. Shared TypeScript Configs (`packages/tsconfig`)

> **Skills to load**: `turborepo`
> **Target**: `packages/tsconfig`

- [x] 2.1 Create `packages/tsconfig/package.json` (`@mfe/tsconfig`, no build script — JSON-only package)
- [x] 2.2 Create `packages/tsconfig/base.json` with `strict: true`, `skipLibCheck: true`, `moduleResolution: "bundler"`, `target: "ES2022"`, `module: "ESNext"`, `declaration: true`, `declarationMap: true`, `composite: true`
- [x] 2.3 Create `packages/tsconfig/react.json` extending `base.json` with JSX transform (`jsx: "react-jsx"`) and DOM lib entries
- [x] 2.4 Create `packages/tsconfig/node.json` extending `base.json` with Node.js type definitions

## 3. Shared Package Scaffolds

> **Skills to load**: `turborepo`
> **Targets**: `packages/shared`, `packages/ui`, `packages/store`, `packages/api`

- [x] 3.1 Scaffold `packages/shared` — `package.json` (`@mfe/shared`, `main`, `types`, `exports` → `dist/`, build/dev scripts via `tsc`), `tsconfig.json` (extends `@mfe/tsconfig/react.json`, `outDir: "./dist"`, `include: ["src"]`), `src/index.ts` (placeholder export)
- [x] 3.2 Scaffold `packages/ui` — `package.json` (`@mfe/ui`, same compiled pattern), `tsconfig.json` (extends `@mfe/tsconfig/react.json`), `src/index.ts` (placeholder export)
- [x] 3.3 Scaffold `packages/store` — `package.json` (`@mfe/store`, same compiled pattern, depends on `@mfe/shared: "workspace:*"`), `tsconfig.json` (extends `@mfe/tsconfig/react.json`), `src/index.ts` (placeholder export)
- [x] 3.4 Scaffold `packages/api` — `package.json` (`@mfe/api`, same compiled pattern, depends on `@mfe/shared: "workspace:*"`), `tsconfig.json` (extends `@mfe/tsconfig/react.json`), `src/index.ts` (placeholder export)

## 4. Frontend App Scaffolds (Rsbuild + React 19)

> **Skills to load**: `turborepo`, `mf` (integrate sub-skill)
> **Targets**: `apps/host`, `apps/storefront`, `apps/account`

- [x] 4.1 Scaffold `apps/host` — `package.json` (`@mfe/host`, depends on all shared packages + react 19 + react-dom + react-router + rsbuild + MF plugin), `tsconfig.json` (extends `@mfe/tsconfig/react.json`), `src/index.tsx` (React 19 `createRoot` entry), `src/App.tsx` (minimal component), `rsbuild.config.ts` (dev server port 3000, MF plugin registered)
- [x] 4.2 Scaffold `apps/storefront` — same structure as host but `@mfe/storefront`, port 3001, MF provider role
- [x] 4.3 Scaffold `apps/account` — same structure as host but `@mfe/account`, port 3002, MF provider role

## 5. Backend App Scaffold (Express + TypeScript)

> **Skills to load**: `turborepo`
> **Target**: `apps/backend`

- [x] 5.1 Scaffold `apps/backend` — `package.json` (`@mfe/backend`, depends on `express`, devDeps on `@types/express`, `tsx`, `@mfe/tsconfig`), `tsconfig.json` (extends `@mfe/tsconfig/node.json`), `src/index.ts` (Express server listening on port 3003), build via `tsc`, dev via `tsx --watch`

## 6. Module Federation Wiring

> **Skills to load**: `mf` (integrate sub-skill, shared-deps sub-skill)
> **Targets**: `apps/host`, `apps/storefront`, `apps/account`

- [x] 6.1 Create `apps/host/module-federation.config.ts` — `name: "host"`, shared singletons (react `^19.0.0`, react-dom `^19.0.0`, react-router `^7.0.0`, zustand `^5.0.0`), no remotes yet
- [x] 6.2 Create `apps/storefront/module-federation.config.ts` — `name: "storefront"`, same shared singletons, no exposes yet
- [x] 6.3 Create `apps/account/module-federation.config.ts` — `name: "account"`, same shared singletons, no exposes yet

## 7. Development Conventions Document

> **Skills to load**: none (reference ADRs in project context)
> **Target**: repo root

- [x] 7.1 Create `CONVENTIONS.md` at repo root covering: naming conventions (`@mfe/` scope, kebab-case files, PascalCase components), file organization rules (apps vs packages boundary, MFE-specific vs shared components), state management boundaries (Zustand scope, TanStack Query for server state, local React state), import/dependency rules (`workspace:*`, no phantom deps, all data fetching via `@mfe/api`), and AI development guidelines (OpenSpec workflow, skill loading requirements)

## 8. Install & Verify

> **Skills to load**: `turborepo`
> **Target**: repo root

- [x] 8.1 Run `pnpm install` from repo root and verify all workspace packages resolve correctly
- [x] 8.2 Run `turbo run build` from repo root and verify all packages and apps compile with zero errors
- [x] 8.3 Run `turbo run typecheck` and confirm clean output across all workspace members
