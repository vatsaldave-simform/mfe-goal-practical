## ADDED Requirements

### Requirement: Prisma schema defines User model with SQLite provider
The `apps/backend/prisma/schema.prisma` file SHALL configure the Prisma datasource with the SQLite provider and a `generator client` block using the v7 `prisma-client` provider with an explicit output path. It SHALL define a `User` model with fields: `id` (UUID string, default uuid), `email` (unique string), `name` (string), `password` (string), `createdAt` (DateTime, default now), and `updatedAt` (DateTime, auto-updated).

#### Scenario: Schema file exists with correct datasource
- **WHEN** inspecting `apps/backend/prisma/schema.prisma`
- **THEN** the datasource block specifies `provider = "sqlite"` (no `url` in schema — URL is resolved via `prisma.config.ts`)
- **THEN** the generator block specifies `provider = "prisma-client"` and `output = "../generated"`

#### Scenario: User model has all required fields
- **WHEN** inspecting the `User` model in `schema.prisma`
- **THEN** it contains `id String @id @default(uuid())`, `email String @unique`, `name String`, `password String`, `createdAt DateTime @default(now())`, and `updatedAt DateTime @updatedAt`

#### Scenario: Prisma client generates successfully
- **WHEN** running `prisma generate` from the `apps/backend` directory
- **THEN** the Prisma client is generated under `apps/backend/generated/client/` without errors
- **THEN** the client can be imported as `import { PrismaClient } from '../generated/client'`

### Requirement: PrismaClient singleton uses driver adapter and prevents multiple instances
The `src/lib/prisma.ts` module SHALL export a single `prisma` PrismaClient instance constructed with a `PrismaBetterSqlite3` driver adapter (from `@prisma/adapter-better-sqlite3`) and cached on `globalThis` during development to prevent multiple instances when the module is re-imported during hot reload. The client SHALL be imported from `'../../generated/client'`.

#### Scenario: Singleton instance is exported
- **WHEN** importing `prisma` from `src/lib/prisma.ts` in two different modules
- **THEN** both imports reference the same PrismaClient instance

#### Scenario: Global caching in non-production
- **WHEN** `NODE_ENV` is not `"production"`
- **THEN** the PrismaClient instance is stored on `globalThis` to survive module re-evaluation during development (tsx watch)

#### Scenario: Driver adapter is wired
- **WHEN** inspecting `src/lib/prisma.ts`
- **THEN** `PrismaBetterSqlite3` is imported from `'@prisma/adapter-better-sqlite3'` and passed to `new PrismaClient({ adapter })`

### Requirement: Database migration creates the User table
Running `npx prisma migrate dev` SHALL create an initial migration that generates the `User` table in the SQLite database file at `apps/backend/prisma/dev.db`.

#### Scenario: Initial migration succeeds
- **WHEN** the developer runs `npx prisma migrate dev --name init` from `apps/backend`
- **THEN** a migration SQL file is created under `prisma/migrations/` and the `User` table exists in `dev.db`

#### Scenario: Migration is idempotent
- **WHEN** the developer runs `npx prisma migrate dev` again after the initial migration
- **THEN** Prisma reports that no new migrations are needed and the database is up to date

### Requirement: Seed script creates a test user
The `apps/backend/prisma/seed.ts` script SHALL create (or upsert) a test user with email `test@example.com`, name `Test User`, and bcrypt-hashed password `password123`. The script is registered under the `migrations.seed` field of `prisma.config.ts` (Prisma v7 — NOT under `package.json`'s `prisma.seed`).

#### Scenario: Seed creates the test user
- **WHEN** the developer runs `prisma db seed` from `apps/backend`
- **THEN** a user with email `test@example.com` and name `Test User` exists in the database with a bcrypt-hashed password

#### Scenario: Seed is idempotent via upsert
- **WHEN** the developer runs `prisma db seed` multiple times
- **THEN** no duplicate user error occurs; the existing test user is updated in place

#### Scenario: Seed is configured in prisma.config.ts
- **WHEN** inspecting `apps/backend/prisma.config.ts`
- **THEN** the `migrations.seed` field is set to `"tsx prisma/seed.ts"`
- **THEN** `apps/backend/package.json` does NOT contain a `prisma.seed` field (v6 pattern removed)

### Requirement: SQLite database and generated files are git-ignored
The Prisma SQLite database files and generated client directory SHALL be excluded from version control to prevent binary file conflicts and ensure each developer generates their own local database and client.

#### Scenario: dev.db and generated/ are in gitignore
- **WHEN** inspecting the `.gitignore` file (root or `apps/backend/`)
- **THEN** it includes entries for `prisma/dev.db`, `prisma/dev.db-journal`, and `generated/`

### Requirement: prisma.config.ts configures Prisma CLI for v7
The `apps/backend/prisma.config.ts` file SHALL use `defineConfig` from `prisma/config` to configure the schema path, `DATABASE_URL` datasource, and seed command.

#### Scenario: prisma.config.ts exists with correct structure
- **WHEN** inspecting `apps/backend/prisma.config.ts`
- **THEN** it exports a `defineConfig` with `schema: 'prisma/schema.prisma'`, `datasource.url` reading from the `DATABASE_URL` env var, and `migrations.seed: 'tsx prisma/seed.ts'`

### Requirement: .env provides DATABASE_URL for Prisma CLI
The `apps/backend/.env` file SHALL set `DATABASE_URL="file:./dev.db"` so Prisma CLI commands can resolve the SQLite database path.

#### Scenario: .env contains DATABASE_URL
- **WHEN** inspecting `apps/backend/.env`
- **THEN** it contains `DATABASE_URL="file:./dev.db"`

### Requirement: Prisma dependencies are added to backend package.json
The `apps/backend/package.json` SHALL include `@prisma/client`, `@prisma/adapter-better-sqlite3`, and `better-sqlite3` as production dependencies and `prisma` as a dev dependency.

#### Scenario: Dependencies are declared
- **WHEN** inspecting `apps/backend/package.json`
- **THEN** `dependencies` includes `@prisma/client`, `@prisma/adapter-better-sqlite3`, and `better-sqlite3`
- **THEN** `devDependencies` includes `prisma`

### Requirement: Backend package.json includes db management scripts
The `apps/backend/package.json` SHALL include convenience scripts for database operations. The `db:migrate` script MUST chain `prisma generate` because Prisma v7's `migrate dev` does not auto-run generation.

#### Scenario: db scripts are defined
- **WHEN** inspecting the `scripts` section of `apps/backend/package.json`
- **THEN** it includes `"db:migrate": "prisma migrate dev && prisma generate"`, `"db:seed": "prisma db seed"`, `"db:studio": "prisma studio"`, and `"db:reset": "prisma migrate reset"`
