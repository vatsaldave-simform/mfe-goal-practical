## 1. Package Setup

> **Skills to load**: zustand, turborepo

- [x] 1.1 Add `zustand` as a runtime dependency in `packages/store/package.json` — target: `packages/store`
- [x] 1.2 Run `pnpm install` to update lockfile — target: repo root

## 2. Store Types

> **Skills to load**: zustand, typescript-advanced-types

- [x] 2.1 Create `packages/store/src/types.ts` with `AuthSlice` type (`isAuthenticated: boolean`, `user: SafeUser | null`, `setAuth: (user: SafeUser) => void`, `clearAuth: () => void`), `CartSlice` type (`itemCount: number`, `setCartCount: (count: number) => void`, `clearCart: () => void`), and combined `StoreState = AuthSlice & CartSlice` — target: `packages/store`

## 3. Auth Slice

> **Skills to load**: zustand

- [x] 3.1 Create `packages/store/src/slices/auth.ts` — export `createAuthSlice` as a `StateCreator<StoreState, [], [], AuthSlice>` using simple `set()` calls for `setAuth` and `clearAuth` — target: `packages/store`

## 4. Cart Slice

> **Skills to load**: zustand

- [x] 4.1 Create `packages/store/src/slices/cart.ts` — export `createCartSlice` as a `StateCreator<StoreState, [], [], CartSlice>` using simple `set()` calls for `setCartCount` and `clearCart` — target: `packages/store`

## 5. Combined Store & Barrel Export

> **Skills to load**: zustand

- [x] 5.1 Replace `packages/store/src/index.ts` — create the combined store via `create<StoreState>()(...)` merging both slices, export `useStore` hook, re-export all types from `./types` — target: `packages/store`

## 6. Build Verification

> **Skills to load**: turborepo

- [x] 6.1 Run `pnpm --filter @mfe/store run build` and verify exit code 0 with `dist/` output — target: `packages/store`
