## 1. Dependencies

- [x] 1.1 Add `axios` and `@tanstack/react-query` to `packages/api/package.json` dependencies; add `react` and `react-dom` to `peerDependencies` — **target:** `packages/api` — **skills:** turborepo
- [x] 1.2 Run `pnpm install` from the workspace root to update the lockfile — **target:** root

## 2. Axios Client

- [x] 2.1 Create `packages/api/src/client.ts` — export `apiClient` (axios instance) with `baseURL: API_BASE_URL`, `withCredentials: true`, `Content-Type: application/json` header — **target:** `packages/api` — **skills:** typescript-advanced-types
- [x] 2.2 Add response interceptor to `apiClient` — on 401 (excluding login/register URLs), set `window.location.href = "/login"` and reject; pass through all other errors unchanged — **target:** `packages/api`

## 3. Query Provider

- [x] 3.1 Create `packages/api/src/provider.tsx` — export `queryClient` singleton with defaults: `staleTime: 60_000`, `gcTime: 300_000`, `retry: 1` — **target:** `packages/api` — **skills:** tanstack-query-best-practices
- [x] 3.2 Export `ApiProvider` component in `provider.tsx` that wraps children in `QueryClientProvider` with the singleton `queryClient` — **target:** `packages/api`

## 4. Query Key Factories

- [x] 4.1 Create `packages/api/src/keys.ts` — export `productKeys` factory with `all`, `lists()`, `list(filters)`, `details()`, `detail(id)` returning readonly tuples — **target:** `packages/api` — **skills:** tanstack-query-best-practices, typescript-advanced-types
- [x] 4.2 Export `cartKeys` factory in `keys.ts` with `all`, `detail()` — **target:** `packages/api`
- [x] 4.3 Export `orderKeys` factory in `keys.ts` with `all`, `lists()`, `list()`, `details()`, `detail(id)` — **target:** `packages/api`
- [x] 4.4 Export `authKeys` factory in `keys.ts` with `all`, `me()` — **target:** `packages/api`

## 5. Barrel & Build

- [x] 5.1 Update `packages/api/src/index.ts` barrel to re-export from `./client`, `./keys`, `./provider` — **target:** `packages/api`
- [x] 5.2 Run `pnpm --filter @mfe/api build` and verify zero TypeScript errors — **target:** `packages/api` — **skills:** turborepo
