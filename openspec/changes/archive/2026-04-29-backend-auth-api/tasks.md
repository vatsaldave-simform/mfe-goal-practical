## 1. Dependencies & Configuration

- [x] 1.1 Add production dependencies to `apps/backend/package.json`: `@prisma/client`, `bcryptjs`, `jsonwebtoken`, `cookie-parser`, `cors`, `zod`
- [x] 1.2 Add dev dependencies to `apps/backend/package.json`: `prisma`, `@types/bcryptjs`, `@types/jsonwebtoken`, `@types/cookie-parser`, `@types/cors`
- [x] 1.3 Add db management scripts to `apps/backend/package.json`: `db:migrate`, `db:seed`, `db:studio`, `db:reset`
- [x] 1.4 ~~Add `prisma.seed` field to `apps/backend/package.json`~~ **Superseded by Prisma v7**: seed is now configured in `prisma.config.ts` under `migrations.seed` (see task 1.9). The `prisma` block in `package.json` should be removed.
- [x] 1.5 Add `prisma/dev.db` and `prisma/dev.db-journal` to `.gitignore` (already present in root `.gitignore`)
- [x] 1.6 Run `pnpm install` from workspace root to install all new dependencies
- [x] 1.7 Add `@prisma/adapter-better-sqlite3` and `better-sqlite3` to `apps/backend` dependencies — required by Prisma v7's standard SQL workflow for SQLite
- [x] 1.8 Add `generated/` to `.gitignore` — Prisma v7 outputs the client to `apps/backend/generated/` (not `node_modules`), so it must be git-ignored
- [x] 1.9 Create `apps/backend/prisma.config.ts` — Prisma v7 CLI config with `defineConfig` (datasource URL from `DATABASE_URL` env var, `migrations.seed` pointing to `tsx prisma/seed.ts`)
- [x] 1.10 Create `apps/backend/.env` with `DATABASE_URL="file:./dev.db"` — required by Prisma CLI when reading from `prisma.config.ts`

Skills to load: `turborepo`, `prisma-database-setup`, `prisma-cli`

## 2. Prisma Schema & Database Setup

- [x] 2.1 Create `apps/backend/prisma/schema.prisma` with SQLite datasource (no `url` in schema — resolved via `prisma.config.ts`) and `User` model (id, email, name, password, createdAt, updatedAt); generator block must use `provider = "prisma-client"` with `output = "../generated"`
- [x] 2.2 Run `prisma migrate dev --name init` then `prisma generate` then `prisma db seed` explicitly from `apps/backend` — **in Prisma v7 `migrate dev` does NOT auto-run `generate` or `seed`**; all three must be run in sequence
- [x] 2.3 Update `db:migrate` script in `package.json` to chain generate: `\"prisma migrate dev && prisma generate\"` so generate is never forgotten after schema changes

Skills to load: `prisma-cli`, `prisma-database-setup`

## 3. Shared Library Modules

- [x] 3.1 Create `apps/backend/src/lib/prisma.ts` — PrismaClient singleton with globalThis caching; import from `'../../generated/prisma/client'`; wire `PrismaBetterSqlite3` adapter from `@prisma/adapter-better-sqlite3` at construction time
- [x] 3.2 Create `apps/backend/src/lib/jwt.ts` — `signToken(userId)` and `verifyToken(token)` using `jsonwebtoken`, 7-day expiry, `JWT_SECRET` env with dev fallback

Skills to load: none

## 4. Middleware

- [x] 4.1 Create `apps/backend/src/middleware/validate.ts` — generic Zod validation middleware factory that returns 400 with `{ error, details }` on failure
- [x] 4.2 Create `apps/backend/src/middleware/auth.ts` — reads `token` cookie, verifies JWT, fetches user from DB, attaches `req.user`, returns 401 if invalid

Skills to load: none

## 5. Auth Route Handlers

- [x] 5.1 Create `apps/backend/src/routes/auth.ts` — Express Router with Zod schemas (`registerSchema`, `loginSchema`) and four endpoints:
  - `POST /register` — validate, check email uniqueness, hash password, create user, sign JWT, set cookie, return user
  - `POST /login` — validate, find user, compare password, sign JWT, set cookie, return user
  - `POST /logout` — clear cookie, return message
  - `GET /me` — auth middleware, return `req.user`

Skills to load: none

## 6. Express App Bootstrap

- [x] 6.1 Update `apps/backend/src/index.ts` — add middleware pipeline (cookie-parser → cors → express.json), mount auth router at `/api/auth`, add error handler

Skills to load: none

## 7. Seed Script

- [x] 7.1 Create `apps/backend/prisma/seed.ts` — upserts test user (`test@example.com` / `password123` bcrypt-hashed, name `Test User`)

Skills to load: none

## 8. Verification

- [x] 8.1 Start the backend server and verify all four auth endpoints work correctly via curl (register, login, me, logout)
