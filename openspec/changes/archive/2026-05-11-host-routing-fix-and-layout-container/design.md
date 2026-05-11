## Context

The Account MFE (`apps/account`) exposes a single `./App` component that contains all routes: `login`, `register`, `profile`, `orders`, `orders/:id`. The host mounts this one component under three separate base paths — `/auth/*`, `/account/*`, `/orders/*` — each with different guards. Because React Router matches relative routes under whichever parent path the component is rendered at, visiting `/auth/profile` resolves successfully via the GuestGuard-protected `/auth/*` mount, bypassing auth protection entirely.

Additionally, `ShellLayout` gives pages a full-viewport `<main>` with no inner width constraint. Skeleton fallbacks and content-heavy pages alike span 100% width — inconsistent with narrower form pages (login, register) that apply their own centering internally.

**Current routing flow:**

```
Host /auth/*  (GuestGuard)
  └─ AccountApp
       ├─ login      ✓  /auth/login
       ├─ register   ✓  /auth/register
       └─ profile    ✗  /auth/profile  ← accessible, should be 404

Host /account/*  (AuthGuard)
  └─ AccountApp
       └─ profile    ✓  /account/profile

Host /orders/*  (AuthGuard)
  └─ AccountApp
       ├─ orders     ✓  /orders/orders  ← double segment bug
       └─ orders/:id ✗  /orders/orders/:id
```

## Goals / Non-Goals

**Goals:**
- `/auth/login` and `/auth/register` are only accessible to guests; all other account paths are inaccessible under `/auth/*`.
- `/account/profile` is only accessible to authenticated users.
- `/orders` and `/orders/:id` are only accessible to authenticated users.
- All page-level content (including RemoteSkeleton fallbacks) is constrained to a shared max-width-centered layout column.
- No MFE re-architecture required — stays within ADR-001 (3 MFE boundary).

**Non-Goals:**
- Splitting storefront into separate products/cart MFEs.
- Per-page layout variations (full-bleed hero sections, etc.).
- Changing authentication or cookie strategy (ADR-003 unchanged).

## Decisions

### Decision 1: Expose `./AuthApp` as a second entry point from the Account MFE

**Chosen**: Add `apps/account/src/AuthApp.tsx` that renders only `login` and `register` routes, and expose it as `"./AuthApp"` in `module-federation.config.ts`. `App.tsx` retains only `profile`, `orders`, `orders/:id`.

**Alternative considered**: A single `App.tsx` that accepts a `mode` prop (`"auth" | "account" | "orders"`) to conditionally render route subsets. Rejected because Module Federation exposes components, not invocable functions with props — the host's `React.lazy(() => import("account/App"))` cannot pass initialization props at load time without wrapping patterns that add complexity for no real benefit.

**Alternative 2**: Use a URL prefix detection hook inside AccountApp to self-filter routes. Rejected because it couples the MFE to host routing decisions, violating ADR-004 (host owns routing).

**Per `mf` skill**: Each new expose entry generates its own MF type bundle (`@mf-types/account/AuthApp`). The host's module-federation.config.ts already declares `account` as a remote; no remote URL change needed.

### Decision 2: `PageContainer` lives in `packages/ui`, applied in `ShellLayout`

**Chosen**: Create `packages/ui/src/components/page-container.tsx` — a thin `div` with `mx-auto w-full max-w-5xl px-4` (or similar token-based class). `ShellLayout` wraps its `{children}` in `<PageContainer>`. This means every page slot — including `RemoteSkeleton` fallbacks — inherits the constraint.

**Alternative**: Apply the max-width class directly to each page component. Rejected because skeleton fallbacks would still be full-width (they render in the host, not the MFE), and it creates an inconsistent convention requiring each MFE author to remember the constraint.

**Alternative 2**: A `fullWidth` boolean prop on `ShellLayout`. Rejected per `vercel-composition-patterns` skill rule: avoid boolean prop proliferation — use composition instead. If a future page needs full-bleed, it can opt out by rendering its own layout wrapper.

**Per `shadcn`/`tailwind-design-system` skills**: Use Tailwind semantic layout utilities; avoid hardcoded pixel values in className where a token exists.

### Decision 3: `orders` route structure in the Account MFE

The host mounts `AccountApp` at `/orders/*`. Inside AccountApp, the routes are `orders` and `orders/:id` (relative). This would produce `/orders/orders` — double segment. Fix: rename to `index` and `:id` within the AccountApp for the orders group, OR change the host to mount at `/` with specific order subroutes. 

**Chosen**: Inside AccountApp, keep routes as `orders` and `orders/:id`  relative to the component root — but the host mounts at `/orders/*` which strips the `/orders` prefix, so the relative route `orders` would need to be `index` to match at `/orders`. Change AccountApp to use `<Route index ...>` for the orders list and `<Route path=":id" ...>` for detail, rendered when the host mounts under `/orders/*`.

Actually, the cleanest approach: AccountApp renders routes for profile (at `profile`), but these are mounted by the host under `/account/*` — so `/account/profile` correctly resolves. For orders: host mounts at `/orders/*`, so AccountApp should expose routes `index` and `:id`. Profile is under `/account/*` so `profile` (relative) maps to `/account/profile`.

**Conclusion**: AccountApp has `<Route path="profile" ...>` (under `/account/*`) AND `<Route index ...>` / `<Route path=":id" ...>` for orders (under `/orders/*`). Since the two host mounts are distinct, we either need a single App that handles both or split further.

**Simplest correct fix**: Expose three components from account MFE:
- `./AuthApp` → login, register (under `/auth/*`)
- `./App` → profile (under `/account/*`)  
- `./OrdersApp` → index (orders list), :id (order detail) (under `/orders/*`)

This way each exposed component has unambiguous relative routes with no prefix collision.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Three lazy imports for `account` MFE increases initial JS parse for the manifest | Module Federation shares chunks; all three entries share the same underlying modules (pages, hooks). Overhead is minimal — only the route component trees differ. |
| `PageContainer` max-width too narrow for product grid pages | Set `max-w-6xl` (72rem) as the default — wide enough for product grids, bounded enough to prevent full-bleed skeletons. Storefront product pages can use inner grid classes for tighter layout. |
| Developers bypass `PageContainer` by adding their own wrappers | Convention enforced via `ShellLayout` — all route slots go through it. Document in CONVENTIONS.md. |

## Migration Plan

1. Add `AuthApp.tsx` and `OrdersApp.tsx` to `apps/account/src/`.
2. Scope `App.tsx` to profile-only routes.
3. Update `apps/account/module-federation.config.ts` with new exposes.
4. Add `PageContainer` to `packages/ui`.
5. Export `PageContainer` from `packages/ui/src/index.ts`.
6. Update `apps/host/src/routes/index.tsx` to lazy-import and use the three account components correctly.
7. Wrap `ShellLayout` children in `<PageContainer>`.
8. Verify all routes resolve correctly in dev.

No backend changes. No database migrations. Rollback: revert the account MFE exposes and host route imports.
