## Context

The `apps/backend` Express server currently has a single health-check route and no persistence layer. This design introduces the foundational backend patterns — Prisma ORM with SQLite, JWT authentication via httpOnly cookies, Zod validation middleware, and CORS — that every subsequent backend module (products, cart, orders) will build upon.

Current state of `apps/backend`:
```
apps/backend/
├── src/
│   └── index.ts          ← Express + GET / health check
├── package.json          ← express, tsx, typescript
└── tsconfig.json         ← extends @mfe/tsconfig/node.json
```

Target state after this change:
```
apps/backend/
├── prisma/
│   ├── schema.prisma     ← User model, SQLite provider
│   ├── seed.ts           ← test user seeder
│   └── dev.db            ← SQLite file (git-ignored)
├── generated/
│   └── client/           ← Prisma Client output (git-ignored)
├── src/
│   ├── index.ts          ← Express app with middleware pipeline
│   ├── lib/
│   │   ├── prisma.ts     ← singleton PrismaClient instance
│   │   └── jwt.ts        ← signToken / verifyToken helpers
│   ├── middleware/
│   │   ├── auth.ts       ← JWT cookie verification middleware
│   │   └── validate.ts   ← Zod request body validation middleware
│   └── routes/
│       └── auth.ts       ← /api/auth/* route handlers
├── .env                  ← DATABASE_URL for Prisma CLI
├── prisma.config.ts      ← Prisma v7 CLI config (datasource, seed)
├── package.json
└── tsconfig.json
```

## Goals / Non-Goals

**Goals:**
- Establish a reusable backend architecture pattern (middleware pipeline, route modules, shared lib) that future modules plug into cleanly.
- Implement complete JWT auth flow with httpOnly cookies per ADR-003.
- Use Prisma ORM + SQLite so all subsequent modules inherit a real relational database with typed queries, migrations, and seed data.
- Validate all incoming request bodies with Zod before they reach handlers.
- Provide a seed script with a test user so endpoints are immediately testable via curl.

**Non-Goals:**
- No product/cart/order models or routes (separate modules).
- No refresh token rotation, OAuth, email verification, or password reset.
- No rate limiting or brute-force protection.
- No extraction to `@mfe/shared` — types and schemas stay inline in the backend for now.
- No frontend integration — this change is backend-only.

## Decisions

### D1: Prisma ORM with SQLite provider

**Choice**: Prisma v7 + `@prisma/client` + SQLite (`file:./dev.db`) + `@prisma/adapter-better-sqlite3`

**Why over raw `better-sqlite3`**: The project has relational models with JOINs (cart items → products, orders → items). Prisma's `include` for relations, typed client, and transaction API (`$transaction`) will significantly simplify cart checkout and order queries in future modules. The generated client gives type safety derived from the schema — no manual type definitions needed for DB queries.

**Why over Drizzle**: Prisma's `include` syntax for nested relations is cleaner for this domain. Prisma Studio provides a free DB browser for debugging. The tradeoff is a heavier engine binary (~15 MB), which is irrelevant for a backend server.

**Why SQLite over Postgres**: Zero setup, no external process, single file. Sufficient for a learning project. Prisma makes switching providers later a schema change + migration.

**Schema location**: `apps/backend/prisma/schema.prisma` — standard Prisma convention.

**Prisma v7 generator**: Uses `provider = "prisma-client"` (not the legacy `prisma-client-js`) with an explicit `output = "../generated"` path. The generated client is imported as `import { PrismaClient } from '../generated/client'` rather than `'@prisma/client'`. The `generated/` directory must be added to `.gitignore`.

**Driver adapter required** (Prisma v7 standard SQL workflow): `@prisma/adapter-better-sqlite3` + `better-sqlite3` must be installed and wired to `PrismaClient`. This is how Prisma v7 connects to SQLite locally.

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated"
}

datasource db {
  provider = "sqlite"
}
```

**Alternatives considered**:
- `better-sqlite3` (raw SQL): Rejected — manual SQL strings, no type inference, tedious for relational queries.
- `drizzle-orm`: Viable but Prisma's relation API and Studio tip the scale for this use case.

### D2: User model — minimal fields, password stored as bcrypt hash

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  password  String   // bcrypt hash, never returned in API responses
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Field choices**:
- `id` as UUID string — consistent with all future models, avoids auto-increment leaking info.
- `email` unique — used as the login identifier.
- `password` stored as a bcrypt hash (cost factor 10) — bcryptjs is pure JS, no native compilation issues.
- `createdAt` / `updatedAt` — Prisma convention, useful for debugging and future features.

**What's NOT on the User model yet**: `role`, `avatar`, cart/order relations. Those will be added by the cart and orders modules when they need them.

### D3: JWT in httpOnly cookie (per ADR-003)

```
  ┌─────────┐    POST /api/auth/login     ┌─────────┐
  │ Browser │ ──────────────────────────▶ │ Express │
  │         │    { email, password }       │         │
  │         │                              │         │
  │         │ ◀────────────────────────── │         │
  │         │    Set-Cookie: token=<jwt>;  │         │
  │         │    HttpOnly; Path=/;         │         │
  │         │    SameSite=Lax; Max-Age=7d  │         │
  └─────────┘                              └─────────┘

  Subsequent requests:
  ┌─────────┐    GET /api/auth/me          ┌─────────┐
  │ Browser │ ──────────────────────────▶ │ Express │
  │         │    Cookie: token=<jwt>       │         │
  │         │    (auto-sent)               │   auth  │
  │         │                              │   MW    │
  │         │ ◀────────────────────────── │ ──▶ req │
  │         │    { id, email, name }       │   .user │
  └─────────┘                              └─────────┘
```

**Token payload**: `{ sub: string }` — uses the standard JWT `sub` claim to carry the user ID. The middleware fetches the full user from DB on each request to ensure data freshness (user could be deleted, email changed, etc.).

**Token lifetime**: 7 days (`7d`). For a learning project, this avoids constant re-login. No refresh token mechanism.

**Cookie settings**:
| Attribute   | Value         | Reason                                        |
|-------------|---------------|-----------------------------------------------|
| `httpOnly`  | `true`        | Not accessible via JS — XSS safe              |
| `secure`    | `false` (dev) | localhost doesn't use HTTPS                   |
| `sameSite`  | `lax`         | Sent on top-level navigations, not CSRF-prone |
| `path`      | `/`           | Available to all routes                       |
| `maxAge`    | 7 days (ms)   | Matches JWT expiry                            |

**Cookie name**: `token`

**Alternatives considered**:
- Authorization header + localStorage: Rejected per ADR-003 — vulnerable to XSS.
- `sameSite: strict`: Would prevent cookie from being sent on initial navigation from external links. `lax` is the right balance.

### D4: JWT helper module (`src/lib/jwt.ts`)

Two functions:
- `signToken(userId: string): string` — signs with `JWT_SECRET` env var (falls back to a dev-only default), expiry `7d`.
- `verifyToken(token: string): { sub: string }` — verifies and returns payload, throws on invalid/expired.

**Secret management**: `process.env.JWT_SECRET` with a hardcoded fallback for development (`"dev-secret-do-not-use-in-production"`). No `.env` file parsing library needed — `tsx` supports env vars natively.

### D5: PrismaClient singleton (`src/lib/prisma.ts`)

Prisma v7 requires wiring a driver adapter at construction time. For SQLite, use `@prisma/adapter-better-sqlite3`:

```typescript
import { PrismaClient } from "../generated/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

Standard Prisma singleton pattern — prevents multiple client instances during hot-reload in development (tsx watch recreates the module, but `globalThis` persists).

### D6: Middleware pipeline order

```
  REQUEST
    │
    ▼
  ┌─────────────┐
  │ cookie-parser│  ← parse req.cookies
  └──────┬──────┘
         ▼
  ┌─────────────┐
  │    cors     │  ← allow MFE origins + credentials
  └──────┬──────┘
         ▼
  ┌─────────────┐
  │ express.json│  ← parse JSON body
  └──────┬──────┘
         ▼
  ┌─────────────┐
  │   routes    │  ← /api/auth/* (some have auth MW)
  └──────┬──────┘
         ▼
  ┌─────────────┐
  │ error handler│  ← catch-all error middleware
  └─────────────┘
```

Global middleware applied in `index.ts`. Auth middleware is NOT global — applied per-route (only `GET /api/auth/me` needs it in this module).

### D7: CORS configuration

```typescript
cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
  credentials: true,
})
```

Allows the three MFE dev servers. `credentials: true` is required for the browser to send/receive cookies cross-origin. Per ADR-003, the axios client will use `withCredentials: true`.

### D8: Zod validation middleware (`src/middleware/validate.ts`)

Generic middleware factory that takes a Zod schema and validates `req.body`:

```typescript
import { z } from "zod";

export function validate<T extends z.ZodType>(schema: T) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    next();
  };
}
```

**Inline schemas for now** — `registerSchema` and `loginSchema` are defined in the routes file. They'll be extracted to `@mfe/shared` when frontend modules need them (per proposal non-goal).

**Error format**: `{ error: string, details: Record<string, string[]> }` — the `fieldErrors` shape from Zod's `flatten()` maps cleanly to form field error display on the frontend.

### D9: Auth route handlers

| Endpoint               | Validation         | Auth MW | Response (200)                     | Errors                                |
|-------------------------|--------------------|---------|-------------------------------------|---------------------------------------|
| `POST /api/auth/register` | `registerSchema` | No      | **201** `{ user: { id, email, name } }` + set cookie | 400 validation, 409 email exists     |
| `POST /api/auth/login`    | `loginSchema`    | No      | `{ user: { id, email, name } }` + set cookie | 400 validation, 401 invalid credentials |
| `POST /api/auth/logout`   | —                | No      | `{ message: "Logged out" }` + clear cookie   | —                                     |
| `GET  /api/auth/me`       | —                | Yes     | `{ user: { id, email, name } }`    | 401 not authenticated                 |

**Register flow**:
1. Validate body with Zod
2. Check email uniqueness (Prisma `findUnique`)
3. Hash password (`bcryptjs.hash`, cost 10)
4. Create user (`prisma.user.create`)
5. Sign JWT, set cookie
6. Return user (exclude `password`)

**Login flow**:
1. Validate body with Zod
2. Find user by email
3. Compare password (`bcryptjs.compare`)
4. Sign JWT, set cookie
5. Return user (exclude `password`)

**User response shape** — always exclude `password`:
```typescript
function excludePassword(user: User) {
  const { password, ...rest } = user;
  return rest;
}
```

### D10: Seed script

Location: `apps/backend/prisma/seed.ts`

Creates a test user:
- email: `test@example.com`
- name: `Test User`
- password: `password123` (bcrypt-hashed)

Uses `upsert` to be idempotent — can be run multiple times without error.

Configured in `package.json`:
```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

Invoked via `npx prisma db seed` or automatically on `prisma migrate reset`.

### D11: Error response convention

All error responses follow a consistent shape:
```typescript
{ error: string }                              // simple error
{ error: string, details: Record<string, string[]> }  // validation error
```

This convention will be used across all future modules. The `error` field is a human-readable message. The optional `details` field carries field-level errors for form integration.

### D12: File ownership

| File                          | Owner / Concern                    |
|-------------------------------|------------------------------------|
| `prisma/schema.prisma`        | Data model (Prisma)                |
| `prisma/seed.ts`              | Test data                          |
| `prisma.config.ts`            | Prisma v7 CLI config (datasource, seed) |
| `.env`                        | `DATABASE_URL` for Prisma CLI      |
| `generated/`                  | Prisma Client output (git-ignored) |
| `src/lib/prisma.ts`           | DB client singleton (w/ adapter)   |
| `src/lib/jwt.ts`              | Token sign/verify                  |
| `src/middleware/auth.ts`      | Auth guard                         |
| `src/middleware/validate.ts`  | Zod validation                     |
| `src/routes/auth.ts`          | Auth route handlers                |
| `src/index.ts`                | App bootstrap + MW                 |

All files live under `apps/backend/`. No other packages are touched.

### D13: `prisma.config.ts` and `.env` (Prisma v7 CLI config)

Prisma v7's CLI reads configuration from `prisma.config.ts` (TypeScript config file at the project root) instead of inferring the datasource URL entirely from the schema. The `DATABASE_URL` env var is also required for CLI operations.

**`prisma.config.ts`** (at `apps/backend/prisma.config.ts`):
```typescript
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
```

**`.env`** (at `apps/backend/.env`):
```env
DATABASE_URL="file:./dev.db"
```

**Important v7 migration workflow change**: `prisma migrate dev` no longer auto-runs `prisma generate`. The full setup sequence is:
```bash
prisma migrate dev --name init
prisma generate
prisma db seed   # must be run explicitly
```

**Seed configuration**: Moved from `package.json`'s `prisma.seed` field (v5/v6 pattern) to the `migrations.seed` field in `prisma.config.ts`. The `package.json` `prisma` block is no longer needed for seed configuration inv7.

**`.gitignore` additions**: `generated/` directory (Prisma Client output) must be git-ignored in addition to the existing `prisma/dev.db` and `prisma/dev.db-journal` entries. The `.env` file is already git-ignored.

## Risks / Trade-offs

- **[No refresh tokens] → Mitigation**: Token expires in 7 days; user simply re-logs. Acceptable for a learning project. If needed later, add a `/api/auth/refresh` endpoint and a short-lived access token + long-lived refresh token pair.

- **[JWT secret in code fallback] → Mitigation**: The fallback `"dev-secret-do-not-use-in-production"` is only used when `JWT_SECRET` is not set. Fine for local dev. A production deployment would require setting the env var. Add a startup warning log if using the fallback.

- **[SQLite file committed accidentally] → Mitigation**: `prisma/dev.db` and `prisma/dev.db-journal` are already in `.gitignore`. Additionally, `generated/` (Prisma Client output) must also be git-ignored since it contains auto-generated binary and TypeScript files that should not be committed.

- **[Prisma v7 generate not auto-run after migrate] → Mitigation**: `prisma migrate dev` no longer triggers `prisma generate` in v7. The `db:migrate` convenience script in `package.json` should chain both: `"db:migrate": "prisma migrate dev && prisma generate"`. Developers must know to run generate explicitly after schema changes outside of the migrate workflow.

- **[bcryptjs is slower than native bcrypt] → Mitigation**: Pure JS avoids native compilation issues across platforms. For a learning project with minimal users, performance is irrelevant. Swap to `bcrypt` (native) if needed later.

- **[Middleware fetches user from DB on every authenticated request] → Mitigation**: Ensures fresh data (user could be deleted/updated). For 13 endpoints and a handful of users, the DB round-trip is negligible. Add caching only if profiling shows a bottleneck.

## Open Questions

- **Should `prisma/schema.prisma` include placeholder models for Product, Cart, Order now (empty, to be filled by subsequent modules) or stay purely User-only?** Recommendation: User-only. Each module adds its own models. Avoids premature schema that might change.
