## ADDED Requirements

### Requirement: @mfe/api exports a singleton QueryClient with project-wide defaults
The `@mfe/api` package SHALL export a `queryClient` instance from `src/provider.tsx` configured with sensible cache defaults that apply to all queries unless overridden at the hook level.

#### Scenario: Default staleTime is 60 seconds
- **WHEN** a query is executed without an explicit `staleTime` override
- **THEN** the `queryClient` SHALL treat the data as fresh for 60,000 ms (60 seconds)

#### Scenario: Default gcTime is 5 minutes
- **WHEN** a query becomes inactive (no active observers)
- **THEN** the `queryClient` SHALL retain the cached data for 300,000 ms (5 minutes) before garbage collection

#### Scenario: Default retry is 1
- **WHEN** a query fails without an explicit `retry` override
- **THEN** the `queryClient` SHALL retry the request exactly once before reporting the error

#### Scenario: refetchOnWindowFocus is enabled
- **WHEN** the browser window regains focus
- **THEN** the `queryClient` SHALL trigger a refetch for all active stale queries (default TanStack Query behavior preserved)

### Requirement: @mfe/api exports an ApiProvider component
The `@mfe/api` package SHALL export an `ApiProvider` React component from `src/provider.tsx` that wraps its children in a `QueryClientProvider` using the singleton `queryClient`.

#### Scenario: ApiProvider renders QueryClientProvider
- **WHEN** the host app renders `<ApiProvider>{children}</ApiProvider>`
- **THEN** all descendant components SHALL have access to the singleton `queryClient` via TanStack Query hooks (`useQuery`, `useMutation`, etc.)

#### Scenario: ApiProvider accepts children prop
- **WHEN** `ApiProvider` is used in the component tree
- **THEN** it SHALL accept and render a `children` prop of type `React.ReactNode`

#### Scenario: Only one QueryClient instance exists across the app
- **WHEN** multiple MFE remotes are loaded within the host shell
- **THEN** all remotes SHALL share the same `queryClient` instance because `@mfe/api` is configured as a Module Federation singleton

### Requirement: Package declares @tanstack/react-query and React peer dependencies
The `packages/api/package.json` SHALL list `@tanstack/react-query` in `dependencies` and `react` / `react-dom` in `peerDependencies`.

#### Scenario: @tanstack/react-query is in dependencies
- **WHEN** inspecting `packages/api/package.json`
- **THEN** the `dependencies` object SHALL contain `"@tanstack/react-query"` with a semver range

#### Scenario: react and react-dom are peer dependencies
- **WHEN** inspecting `packages/api/package.json`
- **THEN** the `peerDependencies` object SHALL contain `"react"` and `"react-dom"` entries so the host app provides the React runtime
