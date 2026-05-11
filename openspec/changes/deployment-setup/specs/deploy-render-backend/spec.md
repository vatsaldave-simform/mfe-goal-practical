## ADDED Requirements

### Requirement: Backend deploys as a Render web service with persistent disk
The Express backend SHALL be deployable as a Render web service with a persistent disk mounted for the SQLite database file.

#### Scenario: Build command compiles backend and runs migrations
- **WHEN** Render executes the build command
- **THEN** it runs `pnpm install && turbo run build --filter=@mfe/backend && cd apps/backend && npx prisma migrate deploy`

#### Scenario: Start command runs the compiled backend
- **WHEN** Render starts the service after a successful build
- **THEN** it executes `node apps/backend/dist/src/index.js`

#### Scenario: SQLite database persists across deploys
- **WHEN** the backend is redeployed on Render
- **THEN** the SQLite database file at the persistent disk mount path is preserved and not lost

### Requirement: Backend reads PORT from environment
The Express backend SHALL use `process.env.PORT` to determine the listening port, falling back to `3003` if not set.

#### Scenario: Render provides PORT environment variable
- **WHEN** Render sets `PORT=10000` (Render's default)
- **THEN** the Express server listens on port 10000

#### Scenario: Local development without PORT set
- **WHEN** the backend runs locally without `PORT` in the environment
- **THEN** the Express server listens on port 3003

### Requirement: Backend requires JWT_SECRET in production
The backend SHALL read `JWT_SECRET` from `process.env.JWT_SECRET`, falling back to a dev-only default. The production deployment MUST set a strong, unique `JWT_SECRET` environment variable.

#### Scenario: Production JWT_SECRET is set
- **WHEN** the backend runs on Render with `JWT_SECRET=<random-64-char-string>`
- **THEN** JWT tokens are signed and verified using that secret

#### Scenario: Local dev uses fallback secret
- **WHEN** the backend runs locally without `JWT_SECRET` set
- **THEN** JWT operations use the hardcoded fallback `"dev-secret-change-in-production"`

### Requirement: DATABASE_URL points to persistent disk path in production
The `DATABASE_URL` environment variable on Render SHALL point to a file on the persistent disk mount (e.g., `file:/data/dev.db`).

#### Scenario: Database file resolves to persistent disk
- **WHEN** the backend starts on Render with `DATABASE_URL=file:/data/dev.db` and a disk mounted at `/data`
- **THEN** Prisma reads and writes to `/data/dev.db` which persists across deploys
