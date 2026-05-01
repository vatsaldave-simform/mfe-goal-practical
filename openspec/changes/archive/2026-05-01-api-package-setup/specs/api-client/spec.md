## ADDED Requirements

### Requirement: @mfe/api exports a pre-configured axios instance
The `@mfe/api` package SHALL export a named `apiClient` axios instance from `src/client.ts` that all MFE apps use for HTTP communication with the backend.

#### Scenario: Base URL is configured from shared constants
- **WHEN** any code imports `apiClient` from `@mfe/api`
- **THEN** the instance's `baseURL` SHALL be set to the `API_BASE_URL` constant imported from `@mfe/shared`

#### Scenario: Credentials are included on every request
- **WHEN** `apiClient` makes any HTTP request
- **THEN** the request SHALL include `withCredentials: true` so the browser sends httpOnly JWT cookies automatically

#### Scenario: Default Content-Type header is JSON
- **WHEN** `apiClient` makes a request without an explicit Content-Type
- **THEN** the request SHALL include the header `Content-Type: application/json`

### Requirement: 401 response interceptor redirects to login
The `apiClient` SHALL register a response interceptor that handles HTTP 401 (Unauthorized) responses by redirecting the user to the login page.

#### Scenario: Backend returns 401 on an API call
- **WHEN** `apiClient` receives a response with HTTP status 401
- **THEN** the interceptor SHALL set `window.location.href` to `"/login"` to trigger a full page reload
- **AND** the interceptor SHALL reject the promise so the calling code's error path is still executed

#### Scenario: Non-401 error responses pass through unchanged
- **WHEN** `apiClient` receives a response with any error status other than 401 (e.g., 400, 403, 404, 500)
- **THEN** the interceptor SHALL NOT redirect
- **AND** the rejected promise SHALL propagate the original `AxiosError` to the caller

#### Scenario: 401 interceptor does not redirect for login/register requests
- **WHEN** `apiClient` receives a 401 response for a request to the login or register endpoint
- **THEN** the interceptor SHALL NOT redirect to `/login`
- **AND** the rejected promise SHALL propagate the error so the login form can display an error message

### Requirement: Package declares axios as a runtime dependency
The `packages/api/package.json` SHALL list `axios` in its `dependencies` field so it is available at build time and runtime.

#### Scenario: axios is in dependencies
- **WHEN** inspecting `packages/api/package.json`
- **THEN** the `dependencies` object SHALL contain an `"axios"` entry with a semver range
