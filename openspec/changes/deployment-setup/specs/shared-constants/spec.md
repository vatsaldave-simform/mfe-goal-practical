## MODIFIED Requirements

### Requirement: API_BASE_URL constant provides the backend server origin
The `packages/shared/src/constants.ts` module SHALL export an `API_BASE_URL` constant that reads from `process.env.PUBLIC_API_URL` at declaration time and falls back to `"http://localhost:3003"` when the variable is not defined.

#### Scenario: API_BASE_URL uses environment variable when available
- **WHEN** a consumer imports `API_BASE_URL` from `@mfe/shared` in a Rsbuild-bundled app where `PUBLIC_API_URL=""` was set at build time
- **THEN** the value is `""` (empty string), causing relative API paths

#### Scenario: API_BASE_URL falls back to localhost for local dev
- **WHEN** a consumer imports `API_BASE_URL` from `@mfe/shared` without `PUBLIC_API_URL` defined
- **THEN** the value is `"http://localhost:3003"`
