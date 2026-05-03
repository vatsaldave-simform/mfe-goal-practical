## Context

`@mfe/store` is currently an empty scaffold. The package exists in the workspace with `@mfe/shared` as a dependency and `tsc` as its build tool. All three frontend apps already declare it as a `workspace:*` dependency, and `zustand` is already configured as a shared singleton in every `module-federation.config.ts`.

The shared types this store needs already exist:
- `SafeUser` in `@mfe/shared` (`{ id, email, name, createdAt }`)
- `CartResponse` in `@mfe/shared` (`{ id, items, total, itemCount }`)

The API layer (`@mfe/api`) already has query hooks (`useMe`, `useLogin`, `useLogout`, `useRegister`, `useAddToCart`, etc.) that handle server state. This store is **not** for server data — it exists purely so that all MFEs can synchronously read auth/cart UI state without triggering network requests.

## Goals / Non-Goals

**Goals:**
- Provide an `auth` slice: `isAuthenticated` flag + `user` object for nav guards and UI
- Provide a `cart` slice: `itemCount` for cart badge display across MFEs
- Export a typed `useStore` hook consumable by all MFEs
- Keep the store < 200 lines total — deliberately minimal per ADR-002

**Non-Goals:**
- No full cart item array in the store (server state, belongs in TanStack Query)
- No JWT token handling (httpOnly cookie per ADR-003)
- No devtools middleware in this change (can add later if needed)
- No persistence/hydration middleware (state derived from API on mount, not localStorage)
- No app-level integration (syncing store after mutations is a separate change)

## Decisions

### Decision 1: Zustand v5 `create` with slice pattern

**Choice**: Use Zustand v5's `create` function with the slice pattern — one `StateCreator` per domain (auth, cart), combined in a root `create()` call.

**Alternatives considered**:
- **Single flat store**: Simpler, but mixes auth and cart concerns. Harder to reason about and test independently.
- **Class-based actions (per zustand skill)**: More structured, but overkill for 2 tiny slices totaling ~6 actions. The skill recommends class-based for large slices with many actions.
- **Separate stores**: Two independent `create()` calls. Works, but per ADR-005 we want a single `@mfe/store` singleton via MF — splitting into multiple stores complicates the singleton config.

**Why slice pattern**: It's the standard Zustand approach for combining small, related state domains. Each slice is a separate file, testable in isolation, and they compose cleanly into one store.

```
┌──────────────────────────────────────────────────┐
│  @mfe/store                                      │
│                                                  │
│  ┌──────────────────┐  ┌──────────────────────┐  │
│  │  Auth Slice       │  │  Cart Slice          │  │
│  │  ─────────────── │  │  ─────────────────── │  │
│  │  isAuthenticated  │  │  itemCount           │  │
│  │  user             │  │  setCartCount()      │  │
│  │  setAuth()        │  │  clearCart()         │  │
│  │  clearAuth()      │  │                      │  │
│  └──────────────────┘  └──────────────────────┘  │
│                                                  │
│  Combined via create<StoreState>(...)(...slices)  │
│  Exported as useStore hook                       │
└──────────────────────────────────────────────────┘
```

### Decision 2: Action naming follows zustand skill conventions

**Choice**: Public actions use verb form — `setAuth`, `clearAuth`, `setCartCount`, `clearCart`. No `internal_` prefix needed (no complex business logic in these actions; they are simple `set()` calls per zustand skill: "Use simple set() for booleans/simple values").

**Why**: ADR-002 specifically constrains the store to hold only `{ isAuthenticated, user }` and `{ itemCount }`. All actions are direct state setters — no async operations, no service calls, no orchestration. The `internal_` prefix and reducer pattern are for complex state transitions, which these are not.

### Decision 3: `SafeUser` type reused from `@mfe/shared`, no duplication

**Choice**: Import `SafeUser` from `@mfe/shared` for the `user` field. Do not redeclare or wrap it.

**Why**: `SafeUser` already has the exact shape needed (`id`, `email`, `name`, `createdAt`). It's the same type the backend returns from `/auth/me` and that `@mfe/api`'s `useMe` hook resolves to. Single source of truth per project conventions.

### Decision 4: Cart slice holds only `itemCount`, not full items array

**Choice**: The cart slice holds a single `itemCount: number` field, not the full `CartItem[]` array.

**Why**: Per ADR-002, server-fetched data (cart items, totals, prices) belongs in TanStack Query via `@mfe/api`'s `useCart` hook. The store only needs `itemCount` for the cart badge in the nav — a derived scalar that avoids duplicating mutable server state.

```
┌─────────────────────────────────────────────────────────────────┐
│  Data ownership (per ADR-002)                                   │
│                                                                 │
│  TanStack Query (@mfe/api)          Zustand (@mfe/store)        │
│  ──────────────────────────         ────────────────────        │
│  Cart items array ✓                 itemCount (badge) ✓         │
│  Cart totals ✓                      isAuthenticated ✓           │
│  Full user profile ✓                user summary ✓              │
│  Product lists ✓                    (nothing else)              │
│  Order history ✓                                                │
└─────────────────────────────────────────────────────────────────┘
```

### Decision 5: File structure

**Choice** (owned by `packages/store/`):

```
packages/store/
├── src/
│   ├── index.ts        ← createStore, useStore hook, re-exports types
│   ├── types.ts        ← AuthSlice, CartSlice, StoreState
│   └── slices/
│       ├── auth.ts     ← createAuthSlice StateCreator
│       └── cart.ts     ← createCartSlice StateCreator
├── tsconfig.json       ← (exists, no changes)
└── package.json        ← add zustand dep
```

## Risks / Trade-offs

- **[Risk] Store singleton out of sync with server** → Mitigation: future integration change will sync store from TanStack Query `onSuccess` callbacks (e.g., `useLogin` → `setAuth`, `useAddToCart` → `setCartCount`). This change provides the store; syncing is a separate concern.
- **[Risk] itemCount stale after direct API mutation** → Mitigation: same as above — mutation hooks in `@mfe/api` will call `setCartCount` in `onSuccess`. Until integration, `itemCount` defaults to `0`.
- **[Trade-off] No devtools** → Keeps the initial implementation minimal. Zustand devtools middleware can be added in a future change if debugging cross-MFE state becomes painful.
- **[Trade-off] No persistence** → Auth/cart state is derived from cookies + API on every page load. No need for localStorage hydration.

## Open Questions

_(none — scope is well-constrained by ADR-002)_
