## Why

The account MFE (`apps/account/`) is currently a bare scaffold with a placeholder `App.tsx` and an empty MF `exposes` config. Users cannot log in, register, or view their profile. This change delivers the first functional slice of the account micro-frontend — auth pages, a profile page, TanStack Query hooks, MF provider wiring, and standalone dev mode — so the account app can run independently and be consumed by the host shell.

## What Changes

- **MF provider config** — update `module-federation.config.ts` to expose `./App` so the host can load the account remote at runtime.
- **Auth pages** — add `LoginPage` and `RegisterPage` using React Hook Form + Zod schemas (`loginSchema`, `registerSchema` from `@mfe/shared`). On success both pages call `setAuth()` in the Zustand store and navigate to `/`.
- **Profile page** — add `ProfilePage` that calls `GET /auth/me` via the `useMe` query hook from `@mfe/api` and displays user info.
- **TanStack Query hooks wired in** — consume `useLogin`, `useRegister`, `useMe` from `@mfe/api` (already specified in the `auth-query-hooks` spec).
- **Internal routing** — add `pages/` directory with route-ready page components; `App.tsx` exports a `<Routes>` block with relative paths (`login`, `register`, `profile`).
- **Standalone dev mode** — wrap `App.tsx` in its own `BrowserRouter` + `QueryClientProvider` only when running standalone (the host provides these in production).
- **Tailwind + UI wiring** — import `@mfe/ui` design tokens and use shared components (`Button`, `Input`, `Card`, `Label`) for consistent styling.

## Non-goals

- **Orders page** — deferred to a later phase (account-mfe phase 2).
- **Password reset / forgot password** — out of scope.
- **Backend changes** — JWT auth endpoints and the auth middleware already exist per the `jwt-auth` spec. No backend work in this change.
- **Host routing integration** — the host already has remote entries and route config for account (per `host-mf-consumer`). This change only wires the provider side.
- **Token management** — per ADR-003, JWT is in httpOnly cookies; this change does not touch token storage.

## Capabilities

### New Capabilities
- `account-auth-pages`: Login and Register pages with form validation, mutation hooks, store integration, and post-auth navigation.
- `account-profile-page`: Profile page displaying current user info via the `useMe` query hook.
- `account-mf-provider`: Module Federation provider configuration exposing `./App`, standalone dev bootstrap, and internal routing.

### Modified Capabilities
- `mf-wiring`: Account app's `exposes` field changes from `{}` to `{ "./App": "./src/App.tsx" }`, fulfilling the previously noted gap.

## Impact

- **`apps/account/`** — new pages, components, hooks consumption, routing, standalone bootstrap, MF exposes update.
- **`apps/account/module-federation.config.ts`** — adds `exposes: { "./App": "./src/App.tsx" }`.
- **`apps/account/package.json`** — may need `react-hook-form` and `@hookform/resolvers` as dependencies (form handling).
- **Shared packages consumed** — `@mfe/api` (useLogin, useRegister, useMe), `@mfe/store` (setAuth, clearAuth), `@mfe/shared` (loginSchema, registerSchema, SafeUser, ROUTES), `@mfe/ui` (Button, Input, Card, Label).
- **No breaking changes** — the host already declares account as a remote; exposing `./App` is additive.

## Skills

- **mf** — MF provider config (`exposes`, shared singletons).
- **shadcn** — UI component usage (Button, Input, Card, Label, FieldGroup/Field pattern).
- **tailwind-design-system** — Tailwind v4 token consumption in the account app.
- **tanstack-query-best-practices** — consuming auth query hooks, QueryClientProvider in standalone mode.
- **zustand** — consuming `setAuth` / `clearAuth` actions from `@mfe/store`.
- **vercel-react-best-practices** — React component patterns, lazy loading, Suspense.
- **typescript-advanced-types** — type-safe form handling with Zod inferred types.
- **rsbuild-best-practices** — Rsbuild dev server and MF plugin configuration.

## Relevant ADRs

- **ADR-001** (MFE Boundaries) — account owns Auth + Profile domain.
- **ADR-002** (State Management) — Zustand for auth state, TanStack Query for server data, React Hook Form for form state.
- **ADR-003** (Authentication) — JWT in httpOnly cookies, Zustand holds `{ isAuthenticated, user }` only.
- **ADR-004** (Routing) — host owns BrowserRouter; MFEs export route-ready components with relative `<Routes>`.
- **ADR-005** (MF Shared Singletons) — react, react-dom, react-router, zustand shared as singletons.
- **ADR-006** (API Layer) — all data fetching through `@mfe/api`; no direct axios in MFE code.
- **ADR-008** (Form Handling) — React Hook Form + Zod; schemas from `@mfe/shared`; form components local to MFE.
