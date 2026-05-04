## Context

The host app (`apps/host`) is the shell entry point for the MFE e-commerce platform. Currently it is a bare Rsbuild + React 19 scaffold (per `app-scaffolds` spec) with an empty `remotes: {}` in its MF config (per `mf-wiring` spec foundation stage). There is no routing, no layout chrome, and no mechanism to load the storefront or account remotes at runtime.

The storefront (`:3001`) and account (`:3002`) MFE providers exist as bare scaffolds with empty `exposes: {}`. They will be wired as providers in their own future changes; this change focuses exclusively on the host consumer side so that when those providers start exposing modules, the host is ready to consume them.

Packages already available: `@mfe/ui` (shadcn components — Button, Badge, DropdownMenu, Avatar, Skeleton, etc.), `@mfe/store` (Zustand — auth + cart slices), `@mfe/shared` (types, constants, utils), `@mfe/api` (axios client + TanStack Query hooks).

## Goals / Non-Goals

**Goals:**
- Transform host into a functional MF consumer that declares storefront and account as remotes
- Establish the single `BrowserRouter` instance the entire app shares (per ADR-004)
- Build the shell layout: top navbar (logo, nav links, cart badge, account icon) + main content slot
- Lazy-load remote MFE components at route boundaries via `React.lazy` + `Suspense`
- Add `@mfe/store` and `@mfe/api` as MF shared singletons (per ADR-005)

**Non-Goals:**
- Auth guards / protected routes (future auth-integration change)
- Storefront or account provider `exposes` config (separate changes)
- Mobile/responsive hamburger menu
- Footer or secondary layout regions
- Real cart item count from store (placeholder until store integration wired)

## Decisions

### D1: MF remote entries use manifest URLs

**Choice:** Point remotes at `mf-manifest.json` URLs.

```ts
remotes: {
  storefront: "storefront@http://localhost:3001/mf-manifest.json",
  account: "account@http://localhost:3002/mf-manifest.json",
}
```

**Why over hardcoded remoteEntry.js:** Manifest-based loading (per MF v2 docs) allows the runtime to negotiate shared dependencies and versions dynamically. It is the recommended approach for `@module-federation/rsbuild-plugin`.

**Owner:** `apps/host/module-federation.config.ts`

### D2: Shared singletons include @mfe/store and @mfe/api

**Choice:** Add workspace packages to the MF `shared` config:

```ts
shared: {
  react: { singleton: true, requiredVersion: "^19.0.0" },
  "react-dom": { singleton: true, requiredVersion: "^19.0.0" },
  "react-router": { singleton: true, requiredVersion: "^7.0.0" },
  zustand: { singleton: true, requiredVersion: "^5.0.0" },
  "@mfe/store": { singleton: true, requiredVersion: "workspace:*" },
  "@mfe/api": { singleton: true, requiredVersion: "workspace:*" },
}
```

**Why:** Per ADR-005, `@mfe/store` and `@mfe/api` must be runtime singletons so all MFEs share the same Zustand store instance and the same axios/QueryClient instance. Without this, each remote would get its own store copy, breaking cross-MFE state.

**Owner:** `apps/host/module-federation.config.ts` (and mirrored in storefront + account in their respective changes)

### D3: BrowserRouter lives in host entry point

**Choice:** Wrap `<App />` in `<BrowserRouter>` inside `apps/host/src/index.tsx` — not inside `App.tsx`.

```
index.tsx
  └── <BrowserRouter>
        └── <App />
              └── <ShellLayout>
                    └── <Routes> ... </Routes>
```

**Why:** Per ADR-004, the host owns the single router instance. Placing it at the entry point ensures no MFE can accidentally instantiate a second router. `App.tsx` remains a pure component responsible for layout + route definitions.

**Owner:** `apps/host/src/index.tsx`

### D4: Route structure with lazy-loaded remote placeholders

**Choice:** Define routes in a dedicated `src/routes/index.tsx` file. Each remote route uses `React.lazy()` to dynamically import the MF module.

```
/                     → redirect to /products
/products/*           → lazy(() => import("storefront/App"))
/cart                 → lazy(() => import("storefront/App"))
/auth/*               → lazy(() => import("account/App"))
/account/*            → lazy(() => import("account/App"))
```

**Why:** Lazy loading at route boundaries gives code-splitting for free. Each remote is only fetched when the user navigates to its route. The `/*` wildcard allows MFEs to own their own internal routing via relative `<Routes>` (per ADR-004).

**Fallback strategy:** Until storefront/account MFEs actually expose their `./App` modules, `React.lazy` will fail at runtime. We wrap each lazy import with an error boundary that shows a friendly "Module not available" message. This allows the host shell to be developed and tested independently.

**Owner:** `apps/host/src/routes/index.tsx`

### D5: Shell layout as composition of host-owned components

**Choice:** Build the layout in `apps/host/src/components/`:

```
┌─────────────────────────────────────────┐
│  Navbar                                 │
│  ┌──────┬─────────────┬────────────────┐│
│  │ Logo │  Nav Links   │ Cart  Account ││
│  └──────┴─────────────┴────────────────┘│
├─────────────────────────────────────────┤
│  Main Content (Outlet / children)       │
│                                         │
│    <Suspense fallback={<Skeleton>}>     │
│      {route content — remote MFE}       │
│    </Suspense>                          │
│                                         │
└─────────────────────────────────────────┘
```

Components:
- `ShellLayout` — full-page flex container (navbar + main). **Owner:** `apps/host/src/components/shell-layout.tsx`
- `Navbar` — fixed top bar with logo, nav links, cart icon + badge, account dropdown. **Owner:** `apps/host/src/components/navbar.tsx`

**UI dependencies from `@mfe/ui`:** Button, Badge, DropdownMenu, Avatar, Separator, Skeleton. Uses `cn()` for conditional classes, semantic color tokens (bg-background, text-foreground, border-border) per tailwind-design-system skill.

**Nav links:** Products (`/products`), Cart (`/cart`). Account dropdown: Login (`/auth/login`), or Profile (`/account`) + Orders (`/account/orders`) + Logout when authenticated.

**Icons:** `lucide-react` — `ShoppingCart`, `User`, `Package` (logo). Already a transitive dependency via `@mfe/ui` (used by shadcn DropdownMenu chevron icons).

**Owner:** `apps/host/src/components/`

### D6: Suspense boundary per route group

**Choice:** Place `<Suspense>` boundaries around each lazy-loaded route rather than a single top-level boundary.

**Why:** Per vercel-react-best-practices, granular Suspense boundaries prevent entire-page flashes. If storefront remote fails to load, only the content area shows the fallback — navbar remains interactive. Each boundary gets its own skeleton fallback matching the expected content region size.

**Owner:** `apps/host/src/routes/index.tsx`

### D7: Error boundary for remote load failures

**Choice:** Implement a simple `RemoteErrorBoundary` class component that catches chunk load errors from `React.lazy` and shows a "Remote unavailable" message with a retry button.

**Why:** During development, remotes may not be running. In production, network failures can prevent remote loading. The error boundary keeps the shell usable and provides a recovery path.

**Owner:** `apps/host/src/components/remote-error-boundary.tsx`

## Data Flow

```
Browser URL change
       │
       ▼
  BrowserRouter (index.tsx)
       │
       ▼
  App.tsx → ShellLayout
       │         │
       │    ┌────┴────┐
       │    │ Navbar   │ ← reads @mfe/store for cart itemCount + auth state
       │    └─────────┘
       │
       ▼
  <Routes> (routes/index.tsx)
       │
       ├── /products/* → <Suspense> → React.lazy(storefront/App)
       ├── /cart       → <Suspense> → React.lazy(storefront/App)
       ├── /auth/*     → <Suspense> → React.lazy(account/App)
       ├── /account/*  → <Suspense> → React.lazy(account/App)
       └── /           → <Navigate to="/products">
```

## Risks / Trade-offs

- **[Remote unavailable at dev time]** → Mitigated by `RemoteErrorBoundary` showing a friendly fallback. Developers can work on host shell without running storefront/account.
- **[Shared singleton version mismatch]** → Mitigated by pinning `requiredVersion` in MF config. All apps in the monorepo use the same pnpm workspace versions. Per mf shared-deps skill, `loaded-first` shareStrategy resolves to whichever version loads first.
- **[Cart badge shows stale count]** → Acceptable for now. The navbar will read `useStore(s => s.itemCount)` which is `0` until cart integration is wired. No incorrect data, just no data.
- **[lucide-react bundle size]** → Mitigated by tree-shaking — Rsbuild only bundles the specific icons imported, not the full icon library.
- **[Route mismatch between host and remote]** → Host defines the top-level paths (`/products/*`), remotes own sub-paths. If a remote's internal routes change, the host is unaffected as long as the top-level path prefix is stable.
