# Development Conventions

This document defines the conventions used across the `mfe-goal-practical` monorepo. All contributors and AI agents must follow these conventions to maintain consistency and predictability.

---

## 1. Naming Conventions

### Package Scope
- All workspace packages use the `@mfe/` npm scope.
- App packages: `@mfe/host`, `@mfe/storefront`, `@mfe/account`, `@mfe/backend`
- Shared packages: `@mfe/shared`, `@mfe/ui`, `@mfe/store`, `@mfe/api`, `@mfe/tsconfig`

### File Naming
- All files use **kebab-case**: `user-profile.ts`, `cart-item.tsx`, `use-auth.ts`
- Exception: React components use **PascalCase** for the file name when the file exports a single default component: `UserProfile.tsx`, `CartItem.tsx`
- Config files follow their tool's convention: `rsbuild.config.ts`, `module-federation.config.ts`, `turbo.json`

### Component Naming
- React components are **PascalCase**: `UserProfile`, `CartItem`, `CheckoutButton`
- Hooks are **camelCase** prefixed with `use`: `useAuth`, `useCart`, `useUserProfile`
- Utility functions are **camelCase**: `formatPrice`, `parseDate`
- Constants are **SCREAMING_SNAKE_CASE**: `MAX_RETRY_COUNT`, `API_BASE_URL`
- TypeScript types and interfaces are **PascalCase**: `UserProfile`, `CartState`, `ApiResponse`

---

## 2. File Organization Rules

### Apps vs Packages Boundary
- **`apps/`** — Deployable applications. Code here is app-specific and should not be imported by other apps or packages.
  - `apps/host` — Shell application, orchestrates MFEs
  - `apps/storefront` — Storefront micro-frontend (product browsing, cart)
  - `apps/account` — Account micro-frontend (auth, profile)
  - `apps/backend` — Express API server
- **`packages/`** — Shared libraries consumed by apps. Code here must be framework-agnostic where possible and well-typed.
  - `packages/shared` — Shared utilities, types, and constants
  - `packages/ui` — Shared React component library
  - `packages/store` — Shared Zustand store definitions
  - `packages/api` — API client and data-fetching utilities
  - `packages/tsconfig` — Shared TypeScript configurations

### MFE-Specific vs Shared Components
- A component belongs in `packages/ui` if it is used by **two or more** apps.
- A component belongs in an app's `src/` if it is used only within that app.
- Do not create cross-app imports (e.g., `apps/host` must not import from `apps/storefront`). Use Module Federation exposes instead.

### Directory Structure within an App or Package
```
src/
  components/    # React components
  hooks/         # Custom React hooks
  pages/         # Route-level components (apps only)
  store/         # Local Zustand slices (apps only)
  utils/         # Pure utility functions
  types/         # TypeScript type definitions
  index.ts(x)    # Public barrel export
```

---

## 3. State Management Boundaries

### Zustand — Client-Side Global State
- Use **Zustand** (`@mfe/store` or local app store) for UI state that persists across route changes or must be shared between components within an MFE.
- Store definitions live in `packages/store/src/` (shared state) or `apps/<app>/src/store/` (app-local state).
- Each slice is a separate file; combine via a root store if needed.
- **Do not** couple Zustand stores across MFE boundaries at runtime; use Module Federation shared singletons (`singleton: true`) to share the Zustand instance.

### TanStack Query — Server State
- Use **TanStack Query** for all data fetching, caching, and synchronisation with the server.
- All query/mutation functions must be thin wrappers around the `@mfe/api` package — components never call `fetch` directly.
- Query keys follow the pattern: `[resource, id?]` e.g. `['products']`, `['product', productId]`.
- Stale time defaults: 60 s for reference data, 0 for user-specific data.

### Local React State
- Use `useState` / `useReducer` for ephemeral, component-scoped state (form inputs, toggle visibility, hover state).
- Do not lift local state to Zustand unless it genuinely needs cross-component sharing.

---

## 4. Import & Dependency Rules

### Workspace Dependencies
- Always reference workspace packages with `"workspace:*"` in `package.json` — never pin to a fixed version.
- Add a dependency only if the package is actively used; no phantom deps.

### Import Order (enforced by linter)
1. Node built-ins (`node:path`, `node:fs`)
2. External npm packages (`react`, `zustand`)
3. Workspace packages (`@mfe/shared`, `@mfe/ui`)
4. Internal app/package imports (relative paths)

### Data Fetching
- All network calls go through `@mfe/api`. No direct `fetch` or `axios` calls in components or stores.
- `@mfe/api` is the single point of API configuration (base URL, auth headers, error normalisation).

### No Cross-App Imports
- `apps/*` packages must **never** appear in another app's `dependencies`. Share code via `packages/*` or Module Federation.

---

## 5. AI Development Guidelines

### OpenSpec Workflow
- All significant changes follow the **OpenSpec** artifact workflow: Proposal → Specs → Design → Tasks → Implementation → Archive.
- Changes live under `openspec/changes/<change-name>/`.
- Before starting implementation, run `openspec instructions apply --change "<name>" --json` to get the canonical task list and context files.
- After completing all tasks, archive with `openspec archive --change "<name>"`.

### Skill Loading Requirements
- Before implementing any task, check the **skills** listed in the task group header (e.g., `> **Skills to load**: turborepo, mf`).
- Load skills by reading the corresponding `SKILL.md` files in `.agents/skills/<skill>/SKILL.md` before writing code.
- Never guess at framework-specific configuration — use the skill file as the authoritative source.

### Code Generation Guardrails
- Keep changes minimal and scoped to the task at hand.
- Mark each task `- [x]` in `tasks.md` immediately after completion — do not batch-complete.
- If implementation reveals a design issue, pause and suggest updating the relevant spec or design artifact; do not silently work around it.
- Prefer explicit, readable code over clever abstractions when intent is not yet established.

---

## 6. TypeScript Guidelines

- Strict mode is on everywhere (`"strict": true` in `packages/tsconfig/base.json`).
- Prefer `type` over `interface` unless declaration merging is needed.
- Avoid `any` — use `unknown` and narrow with type guards.
- Export public API types from `src/index.ts` barrel.
- Use path aliases sparingly; prefer relative imports within a package.

---

## 7. Module Federation Guidelines

- Shared singletons: `react`, `react-dom`, `react-router`, `zustand` — always `singleton: true`, `requiredVersion` pinned to the minor range (e.g., `^19.0.0`).
- Expose only stable, intentional surfaces via `exposes`. Do not expose internal implementation files.
- Remote URLs are environment-variable driven — never hardcoded.
- Use `@module-federation/rsbuild-plugin` for all Rsbuild-based MFEs.

---

*Last updated: 2026-04-28*
