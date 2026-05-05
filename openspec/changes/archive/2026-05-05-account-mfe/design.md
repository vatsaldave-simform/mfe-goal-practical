## Context

The account MFE (`apps/account/`) is scaffolded with a placeholder `App.tsx`, Rsbuild + MF plugin configured (port 3002), and an empty `exposes: {}`. The host already declares `account` as a remote pointing to `http://localhost:3002/mf-manifest.json`. All shared packages are in place:

- `@mfe/api` exports `useLogin`, `useRegister`, `useMe`, `useLogout` (TanStack Query hooks) — fully implemented per `auth-query-hooks` spec.
- `@mfe/store` exports `useStore` with `setAuth(user)` / `clearAuth()` actions — fully implemented per `store-auth-slice` spec.
- `@mfe/shared` exports `loginSchema`, `registerSchema`, `LoginInput`, `RegisterInput`, `SafeUser`, `ROUTES` — fully implemented per `shared-schemas` spec.
- `@mfe/ui` exports `Button`, `Input`, `Label`, `Card*`, `Field*`, `Alert*`, `Spinner` — all available.
- Backend JWT auth endpoints exist at `/auth/login`, `/auth/register`, `/auth/logout`, `/auth/me` — fully implemented per `jwt-auth` spec.
- Dependencies already in `package.json`: `@mfe/api`, `@mfe/store`, `@mfe/shared`, `@mfe/ui`, `react`, `react-dom`, `react-router`.

Missing: `react-hook-form`, `@hookform/resolvers` (needed for form handling per ADR-008).

## Goals / Non-Goals

**Goals:**
- Wire the account MFE as a functional MF provider exposing `./App`.
- Deliver `LoginPage`, `RegisterPage`, and `ProfilePage` as route-ready components.
- Support standalone development mode (own BrowserRouter + QueryClientProvider).
- Consume only existing shared packages — no new package creation.

**Non-Goals:**
- Orders page (phase 2).
- Logout page/button (host shell owns this via nav).
- Backend changes (already complete).
- Host routing changes (already configured).
- New shared UI components (use existing `@mfe/ui` components).

## Decisions

### D1: App.tsx exports a `<Routes>` component with relative paths

**Choice**: `App.tsx` renders `<Routes>` with relative `<Route>` paths (`login`, `register`, `profile`).

**Why over alternatives**:
- Per ADR-004, the host owns `BrowserRouter`; MFEs export route-ready components with relative `<Routes>`.
- The host mounts account under `/account/*`, so relative paths automatically resolve to `/account/login`, `/account/register`, `/account/profile`.
- Alternative (exporting individual page components) would force the host to know about every account sub-route — violates domain encapsulation.

```
Host (BrowserRouter)
  └── /account/* → <AccountApp />   (lazy-loaded via MF)
        └── <Routes>
              ├── login    → <LoginPage />
              ├── register → <RegisterPage />
              └── profile  → <ProfilePage />
```

### D2: Standalone dev mode wraps in BrowserRouter + ApiProvider

**Choice**: `bootstrap.tsx` wraps `<App />` in `<BrowserRouter>` + `<ApiProvider>` for standalone dev. When consumed via MF, the host provides both.

**Why**: Per ADR-004, only one BrowserRouter may exist. In standalone mode, account needs its own. The `ApiProvider` (from `@mfe/api`) is also provided by the host in production but needed locally. Per tanstack-query `qk-factory-pattern`, the `ApiProvider` creates the `QueryClient` singleton.

```
Standalone (bootstrap.tsx)          MF Consumer (host)
┌──────────────────────┐            ┌──────────────────────┐
│ <BrowserRouter>      │            │ <BrowserRouter>      │ ← host owns
│   <ApiProvider>      │            │   <ApiProvider>      │ ← host provides
│     <App />          │            │     <AccountApp />   │ ← MF remote
│   </ApiProvider>     │            │   </ApiProvider>     │
│ </BrowserRouter>     │            │ </BrowserRouter>     │
└──────────────────────┘            └──────────────────────┘
```

### D3: Form handling with React Hook Form + zodResolver

**Choice**: Each auth form uses `useForm<T>()` with `zodResolver(schema)` where schemas come from `@mfe/shared`.

**Why**: Per ADR-008, Zod schemas are the single source of truth. `zodResolver` bridges Zod → React Hook Form validation. Form components are local to the MFE (not shared) per ADR-008.

**Data flow for login**:
```
LoginPage
  ├── useForm<LoginInput>({ resolver: zodResolver(loginSchema) })
  ├── useLogin()          ← mutation from @mfe/api
  ├── useStore()          ← setAuth from @mfe/store
  └── useNavigate()       ← react-router
  
  onSubmit:
    loginMutation.mutate(data, {
      onSuccess: (response) => {
        setAuth(response.user)   ← update Zustand
        navigate("/")            ← redirect to home
      }
    })
```

### D4: MF `exposes` config — expose `./App` only

**Choice**: `exposes: { "./App": "./src/App.tsx" }`.

**Why**: Per ADR-004, the host lazy-loads one component per MFE at route boundaries. Exposing individual pages would leak internal routing to the host. The `App.tsx` component encapsulates all account routes internally. Per mf `config-check` rules, the expose key must start with `./`.

### D5: Add `@mfe/store` and `@mfe/api` to MF shared singletons

**Choice**: Extend the account MF `shared` config to include `@mfe/store` and `@mfe/api` as singletons (matching host config per ADR-005).

**Why**: The host already shares these as singletons. Without declaring them in the provider, Module Federation may bundle separate copies, breaking the single-store and single-query-client invariants. Per mf `shared-deps` rules, all apps in the federation must agree on shared singletons.

### D6: ProfilePage uses `useMe` query hook — no Zustand for profile data

**Choice**: Profile page calls `useMe()` from `@mfe/api` to fetch user data. Does NOT read from Zustand `user`.

**Why**: Per ADR-002, server-fetched data lives in TanStack Query. The Zustand `user` is a lightweight cache for auth state (used in guards/nav), not the source of truth for profile display. `useMe` ensures fresh data from the server.

### D7: New dependencies — react-hook-form + @hookform/resolvers

**Choice**: Add `react-hook-form` and `@hookform/resolvers` to `apps/account/package.json` dependencies.

**Why**: Per ADR-008, React Hook Form + Zod is the mandated form strategy. These are MFE-local dependencies (not shared via MF) because form state is local per ADR-002.

### D8: Form layout using shadcn Field pattern

**Choice**: Use `<FieldGroup>`, `<Field>`, `<FieldLabel>`, `<FieldError>` from `@mfe/ui` for form layout. Use semantic color tokens (`bg-primary`, `text-destructive`) per shadcn/tailwind-design-system skill rules.

**Why**: Per shadcn skill rules, forms must use FieldGroup+Field (never raw div). This gives consistent spacing, label alignment, and error display.

## Risks / Trade-offs

**[Risk] Standalone dev mode router conflicts with MF mode** → Mitigation: `bootstrap.tsx` wraps in BrowserRouter only when running standalone. When loaded via MF, the host's router is used. The `App.tsx` component itself is router-agnostic (uses relative `<Routes>` only).

**[Risk] Missing `@hookform/resolvers` / `react-hook-form` in lockfile** → Mitigation: Install them in the account app `package.json` and run `pnpm install` before development.

**[Risk] MF shared singleton version mismatch for @mfe/store or @mfe/api** → Mitigation: Use `workspace:*` for version and `singleton: true` in MF config, matching the host's config exactly.

**[Trade-off] Profile page always fetches from server via `useMe`** → Could show stale Zustand `user` instantly while refetching, but we keep it simple: `useMe` handles loading state with a spinner. This trades perceived speed for data freshness and follows ADR-002 strictly.

**[Trade-off] No error boundary around individual pages** → Account MFE relies on the host's global error boundary for now. A local error boundary per page is a phase-2 improvement.
