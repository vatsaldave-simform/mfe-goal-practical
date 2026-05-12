## Context

The backend (`apps/backend`) currently uses SQLite via the `better-sqlite3` driver and `@prisma/adapter-better-sqlite3`. The Prisma schema has `provider = "sqlite"`. This is fine for local development but creates a hard blocker for any shared or deployed environment: SQLite is a single-file, single-process database that cannot be accessed concurrently across machines or processes.

Neon is a serverless Postgres platform with a free tier ideal for learning projects. Prisma 7 uses driver adapters for SQL databases — swapping from the `better-sqlite3` adapter to the `pg` adapter is the primary code change required.

**Current state:**
- `datasource db { provider = "sqlite" }` in `schema.prisma`
- `@prisma/adapter-better-sqlite3` + `better-sqlite3` installed
- `DATABASE_URL=file:/tmp/build.db` workaround in build script (SQLite requires a path on disk)
- Prisma Client instantiated with `BetterSQLite3` adapter in `apps/backend/src/`

**Target state:**
- `datasource db { provider = "postgresql" }` in `schema.prisma`
- `@prisma/adapter-pg` + `pg` installed
- `DATABASE_URL` is a Neon connection string (`postgresql://...@ep-xxx.neon.tech/neondb?sslmode=require`)
- Prisma Client instantiated with `PrismaPg` adapter
- Initial Postgres migration generated from existing schema models

## Goals / Non-Goals

**Goals:**
- Swap SQLite for Neon Postgres with minimal surface-area change (backend only)
- Keep all existing Express routes, middleware, and schema models identical
- Create a clean Postgres migration baseline from the existing 5-model schema
- Document required environment variable in `.env.example`
- Update `package.json` scripts to remove the SQLite `DATABASE_URL` workaround

**Non-Goals:**
- Migrating existing SQLite data
- Adding connection pooling (Neon's serverless driver handles this)
- Setting up Neon branch environments
- Any changes to frontend apps, shared packages, or module federation config

## Decisions

### Decision 1: Use `@prisma/adapter-pg` (not `@prisma/adapter-ppg`)

**Choice:** `@prisma/adapter-pg` with the `pg` JS driver.

**Rationale:** This is a Node.js Express server (not an edge/serverless function). The `@prisma/adapter-ppg` adapter targets edge runtimes (Vercel Edge, Cloudflare Workers). Using the standard `pg` driver for a Node.js Express process is the correct and documented approach (per `prisma-database-setup` skill: "Prisma Postgres (Node.js) → `@prisma/adapter-pg`").

**Alternative considered:** `@prisma/adapter-ppg` — rejected because the backend is a plain Node.js process, not an edge runtime.

```
┌──────────────────────────────────────────┐
│  apps/backend (Node.js / Express)        │
│                                          │
│  PrismaClient                            │
│      └── PrismaPg adapter               │
│              └── pg (JS driver)         │
│                      └── Neon Postgres  │
└──────────────────────────────────────────┘
```

### Decision 2: Keep `prisma.config.ts` shape identical

**Choice:** Only change `datasource.url` — the rest of `prisma.config.ts` (`schema`, `migrations.path`, `migrations.seed`) stays the same.

**Rationale:** The `prisma.config.ts` already loads from `process.env["DATABASE_URL"]`, which is exactly the right pattern. No structural change needed — just point `DATABASE_URL` at a Postgres URL.

### Decision 3: Clear existing SQLite migrations, create Postgres baseline

**Choice:** Delete `prisma/migrations/` contents and run `prisma migrate dev --name init` to generate a fresh Postgres migration from the existing schema.

**Rationale:** SQLite migrations use SQLite-specific DDL that is incompatible with Postgres. A clean baseline is the appropriate approach for this project (no production data, learning context). Per `prisma-cli` skill, `prisma migrate dev` creates and applies the migration in one step.

**Alternative considered:** Using `db push` to sync schema without migrations — rejected because `migrate dev` produces a migration history that is required for `migrate deploy` in production.

### Decision 4: Prisma Client instantiation location

Per `prisma-database-setup` skill, the adapter is instantiated alongside `PrismaClient`. The existing code in `apps/backend/src/` (likely `src/index.ts` or a `src/db.ts`) will be updated:

```ts
// Before (SQLite)
import { PrismaClient } from '../generated/prisma'
import { PrismaLibSQL } from '@prisma/adapter-better-sqlite3'
// ...

// After (Postgres)
import 'dotenv/config'
import { PrismaClient } from '../generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
export const prisma = new PrismaClient({ adapter })
```

## Risks / Trade-offs

**[Risk] Cold starts on free-tier Neon** → Mitigation: Neon's serverless Postgres has minimal cold starts (~100ms). For a learning project this is acceptable. If latency becomes an issue, upgrade to a paid Neon tier or use `?connect_timeout=10` in the connection string.

**[Risk] `DATABASE_URL` not set crashes the server** → Mitigation: Add a startup guard that logs a clear error message if `DATABASE_URL` is missing or doesn't start with `postgresql://`. Document the env var in `.env.example`.

**[Risk] `sslmode=require` needed for Neon but not for local Postgres** → Mitigation: Neon connection strings from the dashboard already include `?sslmode=require`. Document this in `.env.example`. Local dev can omit it.

**[Risk] Existing `prisma/migrations/` has SQLite DDL** → Mitigation: Delete all existing migration directories, reset the migration history, and create a new Postgres baseline with `prisma migrate dev --name init`.

## Migration Plan

1. Install new deps, remove old deps (`pnpm` in `apps/backend`)
2. Update `prisma/schema.prisma` provider to `postgresql`
3. Delete `prisma/migrations/` contents (SQLite-incompatible DDL)
4. Update Prisma Client instantiation to use `PrismaPg`
5. Update `apps/backend/package.json` build script (remove `DATABASE_URL=file:...` prefix)
6. Add `.env.example` with `DATABASE_URL=postgresql://...`
7. Set `DATABASE_URL` in local `.env` (Neon connection string)
8. Run `pnpm prisma migrate dev --name init` to create Postgres migration and generate client
9. Run `pnpm prisma db seed` to populate initial data
10. Verify `pnpm dev` starts cleanly and API endpoints respond

**Rollback:** Revert `schema.prisma` provider, restore old adapters, restore SQLite migrations from git history. SQLite requires no external service so rollback is fast.

## Open Questions

- None blocking implementation. Neon free-tier connection string will need to be created by the developer before running migrations.
