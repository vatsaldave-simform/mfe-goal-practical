## ADDED Requirements

### Requirement: @mfe/api exports a useMe query hook
The `@mfe/api` package SHALL export a `useMe` hook from `src/queries/auth.ts` that fetches the currently authenticated user.

#### Scenario: useMe fetches the current user
- **WHEN** a component calls `useMe()`
- **THEN** the hook SHALL call `apiClient.get(ROUTES.AUTH.ME)`
- **AND** the hook SHALL use `authKeys.me()` as the query key
- **AND** the hook SHALL return a `UseQueryResult<AuthResponse>`

#### Scenario: useMe accepts option overrides
- **WHEN** a component calls `useMe({ staleTime: Infinity })`
- **THEN** the hook SHALL forward the `staleTime` option to `useQuery`
- **AND** the hook SHALL NOT allow overriding `queryKey` or `queryFn`

#### Scenario: useMe can be disabled when user is not authenticated
- **WHEN** a component calls `useMe({ enabled: false })`
- **THEN** the hook SHALL NOT execute the query function

### Requirement: @mfe/api exports a useLogin mutation hook
The `@mfe/api` package SHALL export a `useLogin` hook from `src/queries/auth.ts` that authenticates a user with email and password.

#### Scenario: useLogin posts credentials to the login endpoint
- **WHEN** a component calls `mutate({ email: "user@test.com", password: "pass123" })`
- **THEN** the hook SHALL call `apiClient.post(ROUTES.AUTH.LOGIN, { email: "user@test.com", password: "pass123" })`

#### Scenario: useLogin invalidates auth queries on success
- **WHEN** the login mutation succeeds
- **THEN** the hook SHALL invalidate queries matching `authKeys.all` so `useMe` refetches with the new session

#### Scenario: useLogin accepts LoginInput
- **WHEN** the mutation function is called
- **THEN** it SHALL accept a `LoginInput` object (from `@mfe/shared`) with `email` (string) and `password` (string)

#### Scenario: useLogin returns the AuthResponse
- **WHEN** the login mutation succeeds
- **THEN** the mutation result data SHALL be typed as `AuthResponse` containing `{ user: SafeUser }`

### Requirement: @mfe/api exports a useRegister mutation hook
The `@mfe/api` package SHALL export a `useRegister` hook from `src/queries/auth.ts` that registers a new user.

#### Scenario: useRegister posts registration data to the register endpoint
- **WHEN** a component calls `mutate({ email: "new@test.com", password: "pass123", name: "New User" })`
- **THEN** the hook SHALL call `apiClient.post(ROUTES.AUTH.REGISTER, { email: "new@test.com", password: "pass123", name: "New User" })`

#### Scenario: useRegister invalidates auth queries on success
- **WHEN** the register mutation succeeds
- **THEN** the hook SHALL invalidate queries matching `authKeys.all`

#### Scenario: useRegister accepts RegisterInput
- **WHEN** the mutation function is called
- **THEN** it SHALL accept a `RegisterInput` object (from `@mfe/shared`) with `email` (string), `password` (string), and `name` (string)

#### Scenario: useRegister returns the AuthResponse
- **WHEN** the register mutation succeeds
- **THEN** the mutation result data SHALL be typed as `AuthResponse` containing `{ user: SafeUser }`

### Requirement: @mfe/api exports a useLogout mutation hook
The `@mfe/api` package SHALL export a `useLogout` hook from `src/queries/auth.ts` that logs the user out.

#### Scenario: useLogout posts to the logout endpoint
- **WHEN** a component calls `mutate()`
- **THEN** the hook SHALL call `apiClient.post(ROUTES.AUTH.LOGOUT)`

#### Scenario: useLogout clears the entire query cache on success
- **WHEN** the logout mutation succeeds
- **THEN** the hook SHALL call `queryClient.clear()` to purge all cached data
- **AND** the hook SHALL NOT use targeted invalidation because all cached data is user-scoped

#### Scenario: useLogout accepts no input
- **WHEN** the mutation function is called
- **THEN** it SHALL accept no arguments

### Requirement: Auth hooks use apiClient for all HTTP requests
All auth hooks SHALL use the shared `apiClient` instance from `@mfe/api/client` for HTTP requests.

#### Scenario: useMe uses apiClient
- **WHEN** `useMe` executes its query function
- **THEN** it SHALL call `apiClient.get()` rather than importing axios directly

#### Scenario: Mutation hooks use apiClient
- **WHEN** `useLogin`, `useRegister`, or `useLogout` executes its mutation function
- **THEN** it SHALL call `apiClient.post()` rather than importing axios directly

### Requirement: Auth hooks use route constants from @mfe/shared
All auth hooks SHALL use `ROUTES.AUTH.*` constants from `@mfe/shared` for endpoint URLs.

#### Scenario: useMe uses ROUTES.AUTH.ME
- **WHEN** `useMe` builds its request URL
- **THEN** it SHALL use `ROUTES.AUTH.ME` (value: `"/auth/me"`)

#### Scenario: useLogin uses ROUTES.AUTH.LOGIN
- **WHEN** `useLogin` builds its request URL
- **THEN** it SHALL use `ROUTES.AUTH.LOGIN` (value: `"/auth/login"`)

#### Scenario: useRegister uses ROUTES.AUTH.REGISTER
- **WHEN** `useRegister` builds its request URL
- **THEN** it SHALL use `ROUTES.AUTH.REGISTER` (value: `"/auth/register"`)

#### Scenario: useLogout uses ROUTES.AUTH.LOGOUT
- **WHEN** `useLogout` builds its request URL
- **THEN** it SHALL use `ROUTES.AUTH.LOGOUT` (value: `"/auth/logout"`)

### Requirement: Auth hooks are re-exported from @mfe/api
The `useMe`, `useLogin`, `useRegister`, and `useLogout` hooks SHALL be importable from the `@mfe/api` package entry point.

#### Scenario: Hooks are accessible from the package entry point
- **WHEN** a consumer writes `import { useMe, useLogin, useRegister, useLogout } from "@mfe/api"`
- **THEN** the import SHALL resolve successfully because `src/queries/auth.ts` is re-exported through `src/queries/index.ts` and `src/index.ts`
