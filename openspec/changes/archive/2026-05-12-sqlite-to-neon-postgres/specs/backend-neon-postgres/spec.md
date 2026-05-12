## ADDED Requirements

### Requirement: Neon Postgres connection string is configured via environment variable
The `apps/backend` application SHALL connect to Neon Postgres using a `DATABASE_URL` environment variable containing a valid `postgresql://` connection string. An `.env.example` file SHALL exist at `apps/backend/.env.example` documenting the required variable.

#### Scenario: Application starts with valid DATABASE_URL
- **WHEN** `DATABASE_URL` is set to a valid Neon Postgres connection string (e.g. `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`)
- **THEN** the Express server starts without errors and Prisma connects to the Postgres database

#### Scenario: .env.example documents required variable
- **WHEN** inspecting `apps/backend/.env.example`
- **THEN** it contains `DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require` as a documented placeholder

### Requirement: PrismaClient uses PrismaPg adapter for Neon Postgres
The `src/lib/prisma.ts` (or equivalent) module SHALL construct the PrismaClient with a `PrismaPg` adapter (from `@prisma/adapter-pg`) passing `connectionString: process.env.DATABASE_URL`. The SQLite adapter (`@prisma/adapter-better-sqlite3`) SHALL be removed.

#### Scenario: PrismaPg adapter is wired
- **WHEN** inspecting `apps/backend/src/lib/prisma.ts`
- **THEN** `PrismaPg` is imported from `@prisma/adapter-pg` and passed to `new PrismaClient({ adapter })`
- **THEN** no import of `@prisma/adapter-better-sqlite3` or `better-sqlite3` exists in the codebase

#### Scenario: Singleton instance is retained
- **WHEN** importing `prisma` from `src/lib/prisma.ts` in multiple modules
- **THEN** both imports reference the same PrismaClient instance (global cache pattern preserved)

### Requirement: Postgres migration baseline is created from existing schema
A new Prisma migration SHALL be generated from the existing 5-model schema (User, Product, Cart, CartItem, Order, OrderItem) targeting Postgres DDL. Previous SQLite migrations SHALL be removed.

#### Scenario: Initial Postgres migration exists
- **WHEN** inspecting `apps/backend/prisma/migrations/`
- **THEN** a migration named `*_init` (or similar) exists containing `CREATE TABLE` statements using Postgres syntax (no SQLite-specific types)
- **THEN** no migration files containing `TEXT` casts specific to SQLite remain

#### Scenario: migrate deploy applies cleanly
- **WHEN** running `prisma migrate deploy` against a fresh Postgres database with the `DATABASE_URL` set
- **THEN** all tables are created without errors
