## Why

The backend currently serves only a health-check endpoint (`GET /`). Before any frontend feature can be built against real data, the API needs a working authentication system. Auth is the first backend module because every subsequent module (products, cart, orders) depends on the auth middleware to identify users and protect routes. Building this now unblocks all authenticated API work and establishes the backend's foundational patterns (Prisma ORM, Zod validation, JWT cookie flow, middleware pipeline).

## What Changes

- **Add Prisma ORM** with SQLite provider to `apps/backend`; define `User` model in `schema.prisma` with `provider = "prisma-client"` and `output = "../generated"` generator (Prisma v7); create `prisma.config.ts` with datasource URL and seed config; create `.env` with `DATABASE_URL`; install `@prisma/adapter-better-sqlite3` + `better-sqlite3` driver adapter; generate client and run initial migration.
- **Add auth routes** behind `/api/auth/`:
  - `POST /api/auth/register` — create account (email, name, password), hash password with bcryptjs, return user (sans password), set JWT httpOnly cookie.
  - `POST /api/auth/login` — verify credentials, return user, set JWT httpOnly cookie.
  - `POST /api/auth/logout` — clear the auth cookie.
  - `GET /api/auth/me` — return the currently authenticated user from the JWT cookie (protected).
- **Add auth middleware** — verifies JWT from the `token` httpOnly cookie, attaches `req.user` (`{ id, email, name }`), returns 401 if missing/invalid.
- **Add Zod request validation** — inline schemas for register and login request bodies; middleware that parses and returns 400 on failure.
- **Add CORS configuration** — allow origins `localhost:3000`, `localhost:3001`, `localhost:3002` with `credentials: true`.
- **Add cookie-parser middleware** — required to read httpOnly cookies.
- **Add seed script** — creates a test user (`test@example.com` / `password123`) via Prisma so endpoints can be tested immediately.
- **Add new dependencies** to `apps/backend`: `@prisma/client`, `prisma` (dev), `@prisma/adapter-better-sqlite3`, `better-sqlite3`, `bcryptjs`, `jsonwebtoken`, `cookie-parser`, `cors`, `zod`, and their type packages.

## Non-goals

- Product, cart, or order models/routes — those are separate modules.
- Refresh tokens or token rotation — a single short-lived JWT (e.g. 7 d) in an httpOnly cookie is sufficient for this learning project.
- Email verification, password reset, or OAuth providers.
- Rate limiting or brute-force protection.
- Extracting types/schemas to `@mfe/shared` — that happens after all backend modules are complete (per earlier decision to build backend first, then extract).

## Capabilities

### New Capabilities
- `jwt-auth`: JWT-based authentication flow — register, login, logout, get-current-user endpoints, httpOnly cookie transport, and auth middleware for protecting routes.
- `backend-prisma-setup`: Prisma ORM integration with SQLite — schema definition, client generation, migration workflow, seed script, and database connection management.

### Modified Capabilities
_(none — no existing spec requirements change)_

## Impact

- **Code**: `apps/backend/` — new files under `src/routes/`, `src/middleware/`, `src/lib/`, plus `prisma/schema.prisma` and `prisma/seed.ts` at the backend root.
- **Dependencies**: 7-8 new npm packages added to `apps/backend/package.json`.
- **Database**: New `prisma/dev.db` SQLite file created at `apps/backend/prisma/`. Should be git-ignored.
- **APIs**: 4 new HTTP endpoints under `/api/auth/`.
- **Relevant ADRs**: ADR-003 (Authentication Strategy — httpOnly JWT cookie, Zustand holds `{ isAuthenticated, user }` not the token), ADR-008 (Form Handling — Zod schemas as single source of truth, here used server-side).

## Skills

- `turborepo` — monorepo-aware dependency and script changes.
- `prisma-cli` — Prisma v7 CLI commands: `migrate dev`, `generate`, `db seed`, `db studio`; v7 workflow changes (explicit generate after migrate).
- `prisma-database-setup` — SQLite provider setup, `prisma.config.ts` config, driver adapter (`@prisma/adapter-better-sqlite3`), client instantiation pattern.
