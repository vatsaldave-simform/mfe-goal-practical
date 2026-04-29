## Why

There is no codebase yet — only architecture decisions captured in OpenSpec config. Before any features can be built, the monorepo must be scaffolded: Turborepo pipeline, pnpm workspaces, shared TypeScript configs, all app and package scaffolds with working builds, and Module Federation wiring between the three frontend apps. Every subsequent change (shared-packages, backend-api, host-shell, account-mfe, storefront-mfe) is blocked until this foundation exists and `turbo run build` passes cleanly.

## What Changes

- Create root monorepo configuration: `pnpm-workspace.yaml`, `turbo.json`, root `package.json`, `.npmrc`, `.gitignore`
- Create `CONVENTIONS.md` at root — the AI development rules document referenced by all future changes
- Scaffold `packages/tsconfig` with shared TypeScript configs (`base.json`, `react.json`, `node.json`)
- Scaffold `packages/shared` as an empty buildable package (`@mfe/shared`)
- Scaffold `packages/store` as an empty buildable package (`@mfe/store`)
- Scaffold `packages/api` as an empty buildable package (`@mfe/api`)
- Scaffold `packages/ui` as an empty buildable package (`@mfe/ui`)
- Scaffold `apps/host` as a bare Rsbuild + React 19 app with Module Federation consumer config (port 3000)
- Scaffold `apps/storefront` as a bare Rsbuild + React 19 app with Module Federation provider config (port 3001)
- Scaffold `apps/account` as a bare Rsbuild + React 19 app with Module Federation provider config (port 3002)
- Scaffold `apps/backend` as a bare Express + TypeScript app (port 3003)
- Configure MF shared singletons on all three frontend apps (react, react-dom, react-router, zustand — empty wiring, no exposes/remotes yet)
- Configure Turborepo task pipeline: `build`, `dev`, `lint`, `typecheck` tasks with correct `dependsOn` and `outputs`

## Non-goals

- No business logic, domain types, or API endpoints — that belongs in `shared-packages` and `backend-api` changes
- No UI components, pages, or routing — that belongs in `host-shell`, `account-mfe`, and `storefront-mfe` changes
- No shadcn component installation — that belongs in `shared-packages`
- No Zustand slices or TanStack Query hooks — those belong in `shared-packages`
- No CI/CD pipeline, remote caching, or deployment configuration
- No testing framework setup (defer to a later change)
- No ESLint/Prettier configuration (defer — keep scope tight)

## Capabilities

### New Capabilities

- `monorepo-workspace`: Turborepo + pnpm workspace configuration — defines the workspace topology, task pipeline (build/dev/lint/typecheck), caching rules, and inter-package dependency graph via `dependsOn: ["^build"]`
- `package-scaffolds`: Empty but buildable package scaffolds for all shared packages (`@mfe/shared`, `@mfe/store`, `@mfe/api`, `@mfe/ui`, `@mfe/tsconfig`) — each has `package.json`, `tsconfig.json`, a minimal `src/index.ts`, and a build script that passes
- `app-scaffolds`: Bare but runnable application scaffolds for all apps — three Rsbuild+React 19 frontend apps (host, storefront, account) and one Express+TypeScript backend app, each with dev servers on assigned ports
- `mf-wiring`: Module Federation v2 base configuration on all three frontend apps — `module-federation.config.ts` with shared singleton declarations (react, react-dom, react-router, zustand), placeholder remotes/exposes ready for future changes to fill in
- `dev-conventions`: CONVENTIONS.md document establishing naming conventions, file organization rules, state management boundaries, and AI development guidelines that all future changes must follow

### Modified Capabilities

_None — greenfield project, no existing specs._

## Impact

- **New files**: ~40-50 files across root config, 5 packages, and 4 apps
- **Dependencies**: Installs Turborepo, Rsbuild, React 19, react-dom, react-router, TypeScript, @module-federation/rsbuild-plugin, Express, zustand (as dev/peer deps where appropriate)
- **Dev workflow**: After this change, `turbo run build` compiles all packages and apps; `turbo run dev` starts 4 dev servers (ports 3000-3003)
- **References**: ADR-001 (MFE boundaries), ADR-004 (routing pattern), ADR-005 (MF shared singletons), ADR-010 (integration pattern)

## Skills

- **turborepo**: Monorepo structure, turbo.json pipeline, pnpm-workspace.yaml, package creation best practices
- **mf** (integrate sub-skill): Initial Module Federation setup on each Rsbuild app, shared singleton config
