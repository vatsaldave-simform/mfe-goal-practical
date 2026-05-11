## ADDED Requirements

### Requirement: Auth cookies use secure flag in production
The `setTokenCookie` function in `apps/backend/src/routes/auth.ts` SHALL set `secure: true` when `process.env.NODE_ENV === "production"` and `secure: false` otherwise.

#### Scenario: Production cookie has secure flag
- **WHEN** the backend runs with `NODE_ENV=production` and sets a token cookie
- **THEN** the cookie includes `Secure` attribute, ensuring it is only sent over HTTPS

#### Scenario: Local dev cookie omits secure flag
- **WHEN** the backend runs with `NODE_ENV=development` (or unset) and sets a token cookie
- **THEN** the cookie does not include `Secure` attribute, allowing HTTP in local dev

### Requirement: CORS origin is restricted by environment in production
The Express CORS middleware in `apps/backend/src/index.ts` SHALL read `process.env.ALLOWED_ORIGINS` (comma-separated) and use those as the allowed origins. When the variable is not set, it SHALL fall back to `origin: true` (allow all) for local development.

#### Scenario: Production CORS allows only the host origin
- **WHEN** the backend runs with `ALLOWED_ORIGINS=https://mfe-host.vercel.app`
- **THEN** CORS allows requests from `https://mfe-host.vercel.app` and rejects requests from other origins

#### Scenario: Multiple allowed origins
- **WHEN** the backend runs with `ALLOWED_ORIGINS=https://mfe-host.vercel.app,https://staging-host.vercel.app`
- **THEN** CORS allows requests from both listed origins

#### Scenario: Local dev allows all origins
- **WHEN** the backend runs without `ALLOWED_ORIGINS` set
- **THEN** CORS uses `origin: true`, allowing requests from any origin
