## 1. Dependencies & MF Provider Config

- [x] 1.1 Add `react-hook-form` and `@hookform/resolvers` to `apps/account/package.json` dependencies, run `pnpm install`
  - **Target**: `apps/account/`
  - **Skills to load**: none (package.json edit only)

- [x] 1.2 Update `apps/account/module-federation.config.ts`: set `exposes: { "./App": "./src/App.tsx" }` and add `@mfe/store` + `@mfe/api` to `shared` as singletons with `requiredVersion: "workspace:*"`
  - **Target**: `apps/account/module-federation.config.ts`
  - **Skills to load**: `mf` (sub-skill: `config-check`, `shared-deps`)
  - **Verify**: Config matches host's shared declarations for react, react-dom, react-router, zustand, @mfe/store, @mfe/api

## 2. App Shell & Routing

- [x] 2.1 Rewrite `apps/account/src/App.tsx` to export a route-ready component with `<Routes>` containing relative routes for `login`, `register`, and `profile`
  - **Target**: `apps/account/src/App.tsx`
  - **Skills to load**: `vercel-react-best-practices`
  - **Verify**: No `<BrowserRouter>` in App.tsx; routes use relative paths (no leading `/`)

- [x] 2.2 Update `apps/account/src/bootstrap.tsx` to wrap `<App />` in `<BrowserRouter basename="/account">` + `<ApiProvider>` for standalone dev mode
  - **Target**: `apps/account/src/bootstrap.tsx`
  - **Skills to load**: `tanstack-query-best-practices` (for ApiProvider usage)
  - **Verify**: Standalone mode can navigate between `/account/login`, `/account/register`, `/account/profile`

## 3. LoginPage

- [x] 3.1 Create `apps/account/src/pages/LoginPage.tsx` with React Hook Form + `zodResolver(loginSchema)`, `useLogin` mutation, `setAuth` on success, `navigate("/")`, error display, and loading state
  - **Target**: `apps/account/src/pages/LoginPage.tsx`
  - **Skills to load**: `shadcn`, `tanstack-query-best-practices`, `zustand`, `vercel-react-best-practices`, `typescript-advanced-types`
  - **Verify**: Form validates email + password; submit calls `useLogin`; success updates store and navigates; failure shows error alert; button disabled during submit

## 4. RegisterPage

- [x] 4.1 Create `apps/account/src/pages/RegisterPage.tsx` with React Hook Form + `zodResolver(registerSchema)`, `useRegister` mutation, `setAuth` on success, `navigate("/")`, error display, and loading state
  - **Target**: `apps/account/src/pages/RegisterPage.tsx`
  - **Skills to load**: `shadcn`, `tanstack-query-best-practices`, `zustand`, `vercel-react-best-practices`, `typescript-advanced-types`
  - **Verify**: Form validates name + email + password (min 6); submit calls `useRegister`; success updates store and navigates; failure shows error alert; button disabled during submit

## 5. ProfilePage

- [x] 5.1 Create `apps/account/src/pages/ProfilePage.tsx` that calls `useMe()` from `@mfe/api`, displays user info in a `Card` from `@mfe/ui`, handles loading (Spinner) and error (Alert) states
  - **Target**: `apps/account/src/pages/ProfilePage.tsx`
  - **Skills to load**: `shadcn`, `tanstack-query-best-practices`, `vercel-react-best-practices`
  - **Verify**: Shows spinner while loading; displays name, email, member-since on success; shows alert on error; does NOT read from Zustand store

## 6. Pages Barrel Export

- [x] 6.1 Create `apps/account/src/pages/index.ts` barrel file re-exporting `LoginPage`, `RegisterPage`, `ProfilePage`
  - **Target**: `apps/account/src/pages/index.ts`
  - **Skills to load**: none
  - **Verify**: `App.tsx` can import all pages from `./pages`

## 7. Validation & Smoke Test

- [x] 7.1 Run `pnpm turbo typecheck --filter=@mfe/account` and fix any TypeScript errors
  - **Target**: `apps/account/`
  - **Skills to load**: none
  - **Verify**: Zero typecheck errors

- [x] 7.2 Run `pnpm turbo dev --filter=@mfe/account --filter=@mfe/backend` and verify standalone login + register + profile flow at `http://localhost:3002/account/login`
  - **Target**: `apps/account/`, `apps/backend/`
  - **Skills to load**: none
  - **Verify**: Can navigate to login, register, and profile pages; forms render correctly; login with seeded user works end-to-end
