## MODIFIED Requirements

### Requirement: Prisma schema defines User model with PostgreSQL provider
The `apps/backend/prisma/schema.prisma` file SHALL configure the Prisma datasource with the `postgresql` provider (replacing the previous `sqlite` provider) and a `generator client` block using the v7 `prisma-client` provider with an explicit output path. It SHALL define a `User` model with fields: `id` (UUID string, default uuid), `email` (unique string), `name` (string), `password` (string), `createdAt` (DateTime, default now), and `updatedAt` (DateTime, auto-updated). It SHALL also define a `Product` model with fields: `id` (UUID string, default uuid), `name` (string), `description` (string), `price` (Int, representing cents), `image` (string, URL), `category` (string), `stock` (Int, default 0), and `createdAt` (DateTime, default now).

#### Scenario: Schema file exists with correct datasource
- **WHEN** inspecting `apps/backend/prisma/schema.prisma`
- **THEN** the datasource block specifies `provider = "postgresql"` (no `url` in schema — URL is resolved via `prisma.config.ts`)
- **THEN** the generator block specifies `provider = "prisma-client"` and `output = "../generated/prisma"`

#### Scenario: User model has all required fields
- **WHEN** inspecting the `User` model in `schema.prisma`
- **THEN** it contains `id String @id @default(uuid())`, `email String @unique`, `name String`, `password String`, `createdAt DateTime @default(now())`, and `updatedAt DateTime @updatedAt`

#### Scenario: Product model has all required fields
- **WHEN** inspecting the `Product` model in `schema.prisma`
- **THEN** it contains `id String @id @default(uuid())`, `name String`, `description String`, `price Int`, `image String`, `category String`, `stock Int @default(0)`, and `createdAt DateTime @default(now())`

#### Scenario: Prisma client generates successfully
- **WHEN** running `prisma generate` from the `apps/backend` directory
- **THEN** the Prisma client is generated under `apps/backend/generated/prisma/` without errors
- **THEN** the client includes both `User` and `Product` model types

### Requirement: PrismaClient singleton uses PrismaPg driver adapter
The `src/lib/prisma.ts` module SHALL export a single `prisma` PrismaClient instance constructed with a `PrismaPg` driver adapter (from `@prisma/adapter-pg`) and cached on `globalThis` during development to prevent multiple instances when the module is re-imported during hot reload. The client SHALL be imported from `'../../generated/prisma'`.

#### Scenario: Singleton instance is exported
- **WHEN** importing `prisma` from `src/lib/prisma.ts` in two different modules
- **THEN** both imports reference the same PrismaClient instance

#### Scenario: Global caching in non-production
- **WHEN** `NODE_ENV` is not `"production"`
- **THEN** the PrismaClient instance is stored on `globalThis` to survive module re-evaluation during development (tsx watch)

#### Scenario: PrismaPg driver adapter is wired
- **WHEN** inspecting `src/lib/prisma.ts`
- **THEN** `PrismaPg` is imported from `'@prisma/adapter-pg'` and passed to `new PrismaClient({ adapter })`
- **THEN** no import of `PrismaBetterSqlite3` or `better-sqlite3` adapter exists
