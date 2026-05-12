## 1. Dependencies & Environment Setup

- [x] 1.1 In `apps/backend`, remove `@prisma/adapter-better-sqlite3`, `better-sqlite3`, and `@types/better-sqlite3` from `package.json` dependencies — _Skills: prisma-database-setup_
- [x] 1.2 In `apps/backend`, add `@prisma/adapter-pg` and `pg` as runtime dependencies, and `@types/pg` as a dev dependency — _Skills: prisma-database-setup_
- [x] 1.3 Create a Neon Postgres project at [neon.tech](https://neon.tech) (free tier) and copy the connection string
- [x] 1.4 Create `apps/backend/.env` (gitignored) with `DATABASE_URL=<neon_connection_string>`
- [x] 1.5 Create `apps/backend/.env.example` with `DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require` as a documented placeholder
- [x] 1.6 Run `pnpm install` from the workspace root to sync lockfile

## 2. Prisma Schema & Config

- [x] 2.1 In `apps/backend/prisma/schema.prisma`, change datasource provider from `"sqlite"` to `"postgresql"` — _Skills: prisma-database-setup_
- [x] 2.2 Verify `prisma.config.ts` already loads `DATABASE_URL` via `process.env["DATABASE_URL"]` — no structural changes needed; confirm it points to the new Postgres URL
- [x] 2.3 Delete all existing migration directories under `apps/backend/prisma/migrations/` (SQLite DDL is incompatible with Postgres)

## 3. PrismaClient Adapter Swap

- [x] 3.1 Locate the Prisma singleton file in `apps/backend/src/` (e.g. `src/lib/prisma.ts` or `src/index.ts`) — _Skills: prisma-database-setup_
- [x] 3.2 Replace the `PrismaBetterSqlite3` adapter import and instantiation with `PrismaPg` from `@prisma/adapter-pg`, passing `{ connectionString: process.env.DATABASE_URL! }`
- [x] 3.3 Remove any remaining imports of `better-sqlite3` or `@prisma/adapter-better-sqlite3` from the codebase

## 4. Build Script Cleanup

- [x] 4.1 In `apps/backend/package.json`, remove the `DATABASE_URL=file:/tmp/build.db` prefix from the `build` script — Postgres does not need a file path workaround — _Skills: prisma-cli_
- [x] 4.2 Confirm the updated `build` script is simply `prisma generate && tsc`

## 5. Migration & Client Generation

- [x] 5.1 With `DATABASE_URL` set in `.env`, run `pnpm --filter @mfe/backend exec prisma migrate dev --name init` to create the Postgres baseline migration — _Skills: prisma-cli_
- [x] 5.2 Confirm the migration SQL file under `prisma/migrations/` contains Postgres-compatible `CREATE TABLE` statements for all 6 models (User, Product, Cart, CartItem, Order, OrderItem)
- [x] 5.3 Run `pnpm --filter @mfe/backend exec prisma generate` to regenerate the Prisma Client targeting Postgres
- [x] 5.4 Confirm `apps/backend/generated/prisma/` is updated with no SQLite-specific types

## 6. Seeding & Smoke Test

- [x] 6.1 Run `pnpm --filter @mfe/backend exec prisma db seed` to populate initial data into the Neon Postgres database — _Skills: prisma-cli_
- [x] 6.2 Start the backend with `pnpm --filter @mfe/backend dev` and verify the server starts without errors on port 3003
- [x] 6.3 Hit `GET /products` and verify the API returns the seeded products (confirming database connectivity)
- [x] 6.4 Hit `POST /auth/register` and `POST /auth/login` to verify user auth flow works end-to-end with the Postgres database
