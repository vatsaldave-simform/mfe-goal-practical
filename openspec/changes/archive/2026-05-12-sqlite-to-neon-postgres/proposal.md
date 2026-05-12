## Why

The backend currently uses SQLite (`better-sqlite3`) as its database, which is a local file-based store unsuitable for production deployments — it cannot be shared across multiple processes, cloud instances, or CI pipelines. Migrating to Neon Postgres provides a production-grade, serverless PostgreSQL database with connection pooling, branching for dev/test environments, and zero cold-start latency, while keeping Prisma as the ORM layer.

## What Changes

- **Replace** `@prisma/adapter-better-sqlite3` and `better-sqlite3` with `@prisma/adapter-pg` and `pg` (+ `@types/pg`)
- **Update** `prisma/schema.prisma` datasource provider from `sqlite` to `postgresql`
- **Update** `prisma.config.ts` to load a Postgres `DATABASE_URL` (Neon connection string)
- **Update** `apps/backend/package.json` scripts — remove SQLite-specific `build` workaround (`DATABASE_URL=file:/tmp/build.db`)
- **Update** `apps/backend/src/index.ts` Prisma client instantiation to use `PrismaPg` adapter
- **Add** `.env.example` in `apps/backend/` documenting the required `DATABASE_URL` env var
- **Regenerate** Prisma Client after schema provider change
- **Run** `prisma migrate dev` to create the first Postgres migration from the existing schema
- **Update** environment variable setup in dev, CI, and deployment configurations

## Capabilities

### New Capabilities

- `backend-neon-postgres`: Connection, schema, migrations, and Prisma Client wired to Neon Postgres instead of SQLite

### Modified Capabilities

- `backend-prisma-setup`: Provider changes from `sqlite` to `postgresql`; driver adapter changes from `better-sqlite3` to `pg`; migration baseline created for Postgres

## Impact

- **`apps/backend/`**: `prisma.config.ts`, `prisma/schema.prisma`, `src/index.ts` (or wherever Prisma is instantiated), `package.json` deps and scripts
- **Dependencies**: Remove `@prisma/adapter-better-sqlite3`, `better-sqlite3`, `@types/better-sqlite3`; add `@prisma/adapter-pg`, `pg`, `@types/pg`
- **Environment**: `DATABASE_URL` must now be a Postgres connection string (e.g. `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`)
- **Migrations**: Existing SQLite migrations in `prisma/migrations/` are incompatible — a new Postgres migration baseline will be created
- **No MFE code changes**: All frontend apps (host, storefront, account) and shared packages are unaffected — they communicate with the backend via HTTP API, not directly with the database
- **ADR-003 unchanged**: JWT/auth strategy remains the same

## Non-goals

- Switching away from Prisma ORM (Prisma remains the data access layer)
- Migrating existing SQLite data to Postgres (this is a learning project; fresh seed data is sufficient)
- Setting up Neon branch environments or preview deployments (out of scope for this change)
- Adding connection pooling configuration beyond what `pg` provides by default

## Skills

- `prisma-database-setup`: Provider switch from SQLite → PostgreSQL, driver adapter setup (`@prisma/adapter-pg`)
- `prisma-cli`: Migration commands (`prisma migrate dev`), client generation, config file shape
