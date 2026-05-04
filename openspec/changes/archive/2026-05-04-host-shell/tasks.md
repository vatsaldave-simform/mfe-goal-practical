## 1. Module Federation Consumer Config

- [x] 1.1 Update `apps/host/module-federation.config.ts` — add `storefront` and `account` remotes pointing to their manifest URLs, add `@mfe/store` and `@mfe/api` as shared singletons (target: `apps/host`; skills to load: `mf`, `mf/reference/shared-deps.md`)
- [x] 1.2 Add MF type declarations — create `apps/host/src/@mf-types.d.ts` declaring modules `storefront/App` and `account/App` so TypeScript resolves the lazy imports (target: `apps/host`; skills to load: `mf`)

## 2. Error Boundary

- [x] 2.1 Create `apps/host/src/components/remote-error-boundary.tsx` — a React error boundary class component that catches chunk/network load errors and renders a "Section unavailable" message with a "Try again" button (target: `apps/host`; skills to load: `vercel-react-best-practices`)

## 3. Shell Layout Components

- [x] 3.1 Create `apps/host/src/components/navbar.tsx` — top navbar with logo (Package icon + "MFE Store" text linking to `/products`), nav links ("Products", "Cart") using `NavLink` for active styling, cart icon with conditional Badge from `@mfe/store` `itemCount`, and account icon linking to `/auth/login`. Use `@mfe/ui` Button/Badge and semantic Tailwind tokens (target: `apps/host`; skills to load: `shadcn`, `tailwind-design-system`, `zustand`)
- [x] 3.2 Create `apps/host/src/components/shell-layout.tsx` — flex column layout rendering `<Navbar />` at top and `<main>` with `{children}` filling remaining viewport height (target: `apps/host`; skills to load: `tailwind-design-system`)

## 4. Route Configuration

- [x] 4.1 Create `apps/host/src/routes/index.tsx` — define lazy-loaded route elements: `/` redirects to `/products`, `/products/*` and `/cart` load `storefront/App`, `/auth/*` and `/account/*` load `account/App`. Each lazy route wrapped in `<Suspense>` with Skeleton fallback and `<RemoteErrorBoundary>` (target: `apps/host`; skills to load: `vercel-react-best-practices`, `mf`)

## 5. App Entry Point Wiring

- [x] 5.1 Rewrite `apps/host/src/App.tsx` — render `<ShellLayout>` wrapping `<Routes>` that use the route elements from `routes/index.tsx` (target: `apps/host`; skills to load: `vercel-react-best-practices`)
- [x] 5.2 Update `apps/host/src/index.tsx` — wrap `<App />` in `<BrowserRouter>` from `react-router` (target: `apps/host`)

## 6. Dependencies & Validation

- [x] 6.1 Add `lucide-react` to `apps/host/package.json` dependencies if not already present, then run `pnpm install` (target: `apps/host`; skills to load: `turborepo`)
- [x] 6.2 Run `pnpm --filter @mfe/host typecheck` to verify TypeScript compiles with zero errors (target: `apps/host`)
- [x] 6.3 Run `pnpm --filter @mfe/host build` to verify Rsbuild + MF consumer builds cleanly (target: `apps/host`; skills to load: `mf`)
