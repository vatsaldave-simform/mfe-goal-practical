## Context

This is a greenfield MFE e-commerce learning platform. No code exists yet — only architecture decisions captured in OpenSpec config and the project context. Before any feature work can begin (shared-packages, backend-api, host-shell, account-mfe, storefront-mfe), the monorepo must be scaffolded with working builds end-to-end.

The workspace currently contains only `.agents/`, `.github/`, and `openspec/` directories. Everything described in the proposal must be created from scratch.

Key constraints from ADRs:
- **ADR-001**: 3 MFE apps (host, storefront, account) + 1 backend
- **ADR-005**: react, react-dom, react-router, zustand shared as MF singletons
- **ADR-010**: Build-time packages via `workspace:*`, runtime integration via MF

## Goals / Non-Goals

**Goals:**
- Working `turbo run build` that compiles all packages and apps with zero errors
- Working `turbo run dev` that starts 4 dev servers (ports 3000–3003)
- Correct `dependsOn` graph so `^build` cascades through package dependencies
- MF configs on host/storefront/account with shared singleton declarations (no exposes/remotes yet)
- Every package and app has a minimal but buildable `src/index.ts` (or `.tsx`)
- CONVENTIONS.md that codifies rules for all future AI-driven changes

**Non-Goals:**
- No business logic, domain types, UI components, pages, or routing
- No shadcn installation, Zustand slices, or TanStack Query hooks
- No CI/CD, remote caching, ESLint/Prettier, or testing setup
- No actual MF exposes/remotes wiring (just shared singleton config)

## Decisions

### D1: Package Manager — pnpm with `workspace:*` protocol

**Choice**: pnpm workspaces with `workspace:*` for all internal dependencies.

**Why over npm/yarn**: pnpm's strict node_modules structure prevents phantom dependencies — packages can only import what they explicitly declare. This is critical in a monorepo where accidental cross-imports cause subtle runtime failures. The `workspace:*` protocol ensures `^build` in turbo.json triggers builds for actual dependencies (per turborepo skill: "^build only runs build in packages listed as dependencies").

**Alternatives considered**:
- yarn workspaces: less strict dependency isolation, pnpm hoisting is safer
- npm workspaces: slower, no strict mode

### D2: Turborepo Task Pipeline

**Choice**: Four registered tasks — `build`, `dev`, `lint`, `typecheck`.

```
turbo.json tasks:
┌──────────┬────────────────────────┬─────────────────┬───────────┐
│ Task     │ dependsOn              │ outputs          │ Notes     │
├──────────┼────────────────────────┼─────────────────┼───────────┤
│ build    │ ["^build"]             │ ["dist/**"]      │ cacheable │
│ dev      │ ["^build"]             │ []               │ persistent│
│ lint     │ []                     │ []               │ parallel  │
│ typecheck│ ["^build"]             │ []               │ needs deps│
└──────────┴────────────────────────┴─────────────────┴───────────┘
```

**Rationale** (per turborepo skill rules):
- `build` uses `dependsOn: ["^build"]` so packages build before their consumers
- `dev` uses `dependsOn: ["^build"]` so shared packages compile before app dev servers start, and `persistent: true` + `cache: false` since dev servers are long-running
- `lint` has no `dependsOn` — it reads source, not build output, so it runs in parallel across all packages
- `typecheck` uses `dependsOn: ["^build"]` because type-checking needs `.d.ts` files from built dependencies
- Root `package.json` scripts ONLY delegate via `turbo run <task>` (never `turbo build` shorthand — per turborepo skill anti-pattern rules)
- Each package's `package.json` owns its own script implementation

### D3: TypeScript Configuration Hierarchy — `@mfe/tsconfig`

**Choice**: Three shared configs in `packages/tsconfig`:

```
packages/tsconfig/
├── base.json       ← strict settings, shared by all
├── react.json      ← extends base + JSX, DOM lib (apps + packages/ui)
├── node.json       ← extends base + Node types (apps/backend)
└── package.json    ← @mfe/tsconfig
```

**Why**: Centralizes compiler options so all packages share the same strictness level. Each app/package `tsconfig.json` extends one of these and only adds `include`, `outDir`, and local paths.

**Key settings in `base.json`**:
- `strict: true`, `skipLibCheck: true`, `moduleResolution: "bundler"`
- `target: "ES2022"`, `module: "ESNext"` (Rsbuild handles downleveling)
- `declaration: true`, `declarationMap: true` (for `^build` to produce `.d.ts`)
- `composite: true` for packages (enables project references caching)

### D4: Package Compilation Strategy — Compiled (tsc)

**Choice**: All shared packages (`@mfe/shared`, `@mfe/store`, `@mfe/api`, `@mfe/ui`) use `tsc` to compile `src/` → `dist/`.

**Why over JIT (no build step)**: Per turborepo skill, JIT packages (consumed directly from source) skip the build step but require every consumer's bundler to handle the raw TypeScript. With 3 Rsbuild apps consuming the same packages, compiled output avoids redundant transpilation and ensures `^build` produces artifacts that downstream consumers depend on. This keeps the dependency graph honest.

**Package exports pattern** (per turborepo skill best-practices):
```jsonc
// Each package's package.json
{
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc --project tsconfig.json",
    "dev": "tsc --watch --project tsconfig.json"
  }
}
```

### D5: Rsbuild + MF Plugin for Frontend Apps

**Choice**: All three frontend apps (host, storefront, account) use Rsbuild with `@module-federation/rsbuild-plugin`.

**Config separation** (per MF integrate sub-skill):
```
apps/host/
├── rsbuild.config.ts               ← Rsbuild plugins, dev server port
├── module-federation.config.ts      ← MF name, shared, (future: remotes)
└── src/index.tsx                    ← entry point
```

Each app gets its own `module-federation.config.ts` created via `createModuleFederationConfig()`. The `rsbuild.config.ts` imports it and passes to `pluginModuleFederation()`.

**Why separate files**: MF config changes independently from build config. Keeps diffs clean when future changes add exposes/remotes.

### D6: MF Shared Singleton Configuration

**Choice**: Declare react, react-dom, react-router, and zustand as shared singletons on all three frontend apps.

```typescript
// module-federation.config.ts (all 3 frontend apps)
shared: {
  react: { singleton: true, requiredVersion: '^19.0.0' },
  'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
  'react-router': { singleton: true, requiredVersion: '^7.0.0' },
  zustand: { singleton: true, requiredVersion: '^5.0.0' },
}
```

**Why these four** (per ADR-005): react and react-dom must be singletons (multiple instances break hooks). react-router must be singleton (one router context). zustand must be singleton (one store instance across MFEs).

**Why NOT `shareStrategy: 'loaded-first'` yet**: The MF integrate reference defaults to `loaded-first`, but at this foundation stage with no remotes/exposes, it doesn't matter. Future changes can add it when actual runtime sharing begins.

**No exposes/remotes yet**: This change only wires the shared config. Future changes (host-shell, storefront-mfe, account-mfe) will add `remotes` on host and `exposes` on providers.

### D7: Express Backend — Minimal TypeScript Setup

**Choice**: `apps/backend` uses raw TypeScript compiled with `tsc`, run with `tsx` (or `ts-node`) in dev.

```
apps/backend/
├── src/index.ts      ← Express app, listens on port 3003
├── tsconfig.json     ← extends @mfe/tsconfig/node.json
└── package.json      ← @mfe/backend
```

**Why not Rsbuild**: Backend has no browser code, no MF, no React. Plain `tsc` is simpler and sufficient. `tsx` provides fast dev reloading.

### D8: Dependency Graph

```
                    ┌────────────────┐
                    │  @mfe/tsconfig │  (no build — JSON only)
                    └───────┬────────┘
                            │ extends
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
  ┌──────────┐      ┌──────────┐       ┌──────────────┐
  │@mfe/shared│      │ @mfe/ui  │       │ @mfe/backend │
  │(types,   │      │(shadcn,  │       │ (Express)    │
  │ utils)   │      │ cn())    │       └──────────────┘
  └────┬─────┘      └────┬─────┘
       │                  │
       ├──────────┬───────┤
       ▼          ▼       ▼
  ┌─────────┐ ┌────────┐
  │@mfe/store│ │@mfe/api│
  │(zustand) │ │(axios, │
  │          │ │ tanstk)│
  └────┬─────┘ └───┬────┘
       │            │
       ├────────────┤
       ▼            ▼
  ┌──────────────────────┐
  │   apps/host          │ ◄── MF consumer
  │   apps/storefront    │ ◄── MF provider
  │   apps/account       │ ◄── MF provider
  └──────────────────────┘
```

At foundation stage, `@mfe/store` and `@mfe/api` have no real dependencies on `@mfe/shared` yet (they're empty scaffolds). But `package.json` declares `"@mfe/shared": "workspace:*"` from the start so the `^build` graph is correct when future changes add actual imports.

### D9: Dev Server Port Assignment

| App        | Port | Role         |
|------------|------|--------------|
| host       | 3000 | MF consumer  |
| storefront | 3001 | MF provider  |
| account    | 3002 | MF provider  |
| backend    | 3003 | Express API  |

Ports are hardcoded in each app's config (Rsbuild `server.port` / Express `app.listen`).

### D10: CONVENTIONS.md Scope

A root-level `CONVENTIONS.md` documents:
- Naming conventions (`@mfe/*` scope, file naming patterns)
- File organization rules (what goes where)
- State management boundaries (per ADR-002: what belongs in Zustand vs TanStack Query vs local state)
- Routing rules (per ADR-004: host owns BrowserRouter)
- AI development guidelines (agents must read relevant skills before implementation)

This file is referenced by all future changes and serves as the ground truth for consistency.

## Risks / Trade-offs

**[Compiled packages add build step overhead]** → Mitigation: Turborepo caches `dist/**` outputs. After first build, unchanged packages are instant. `turbo run dev` with `^build` ensures packages compile before apps start. Future optimization: consider JIT for packages if build times become painful.

**[Empty scaffolds may drift from future needs]** → Mitigation: Each scaffold is intentionally minimal (`export {}` or placeholder). Future changes own the real content. The scaffold only ensures the build graph works.

**[MF shared singletons without version pinning]** → Mitigation: We use `requiredVersion` with semver ranges matching the installed versions. Since all apps live in the same monorepo and share the same `pnpm-lock.yaml`, version drift is unlikely. If a provider updates React independently, MF's version negotiation will warn at runtime.

**[No linting/formatting in foundation]** → Mitigation: Deferred intentionally to keep scope tight. Code quality tools arrive in a dedicated change. Risk is low since the foundation is scaffolding, not business logic.

**[`@mfe/tsconfig` is not a buildable package]** → Mitigation: It's JSON-only (no TypeScript source). It doesn't need a build step — other packages reference its files via `extends`. It does need a `package.json` with `name: "@mfe/tsconfig"` so it's a valid workspace member and can be referenced as `"@mfe/tsconfig": "workspace:*"` in dependents.

**[pnpm strict mode may block implicit deps]** → Mitigation: This is a feature, not a bug. Every dependency must be explicitly declared in the consuming package's `package.json`. Catches issues early rather than in production.
