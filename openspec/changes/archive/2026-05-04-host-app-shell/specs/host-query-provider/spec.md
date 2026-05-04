## ADDED Requirements

### Requirement: Host mounts ApiProvider at the root of the component tree
The host app SHALL wrap the entire application tree in `ApiProvider` (from `@mfe/api`) inside `apps/host/src/bootstrap.tsx`, ensuring every component — including lazily-loaded MFE remotes — has access to the shared `QueryClient` instance.

#### Scenario: ApiProvider wraps BrowserRouter
- **WHEN** inspecting `apps/host/src/bootstrap.tsx`
- **THEN** the render tree is `<ApiProvider><BrowserRouter><App /></BrowserRouter></ApiProvider>`

#### Scenario: TanStack Query hooks work inside host components
- **WHEN** any host component calls a TanStack Query hook (e.g., `useMe` from `@mfe/api`)
- **THEN** the hook resolves against the shared `QueryClient` without throwing a "No QueryClient set" error

#### Scenario: TanStack Query hooks work inside MFE remotes
- **WHEN** a lazily-loaded MFE remote (storefront or account) calls a TanStack Query hook
- **THEN** the hook uses the same `QueryClient` instance provided by the host's `ApiProvider`, because `@mfe/api` is shared as a singleton via Module Federation config (ADR-005)

### Requirement: ApiProvider uses the pre-configured QueryClient from @mfe/api
The host app SHALL NOT create its own `QueryClient`. It SHALL import and use the `ApiProvider` component from `@mfe/api`, which already configures sensible defaults (`staleTime: 60_000`, `gcTime: 300_000`, `retry: 1`).

#### Scenario: No duplicate QueryClient
- **WHEN** searching all source files in `apps/host/`
- **THEN** no file creates a `new QueryClient()` — the only `QueryClient` is the one inside `@mfe/api`'s `ApiProvider`
