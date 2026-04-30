## MODIFIED Requirements

### Requirement: Prisma schema defines User model with SQLite provider
The `apps/backend/prisma/schema.prisma` file SHALL configure the Prisma datasource with the SQLite provider and a `generator client` block using the v7 `prisma-client` provider with an explicit output path. It SHALL define a `User` model with fields: `id` (UUID string, default uuid), `email` (unique string), `name` (string), `password` (string), `createdAt` (DateTime, default now), and `updatedAt` (DateTime, auto-updated). It SHALL also define a `Product` model with fields: `id` (UUID string, default uuid), `name` (string), `description` (string), `price` (Int, representing cents), `image` (string, URL), `category` (string), `stock` (Int, default 0), and `createdAt` (DateTime, default now).

#### Scenario: Schema file exists with correct datasource
- **WHEN** inspecting `apps/backend/prisma/schema.prisma`
- **THEN** the datasource block specifies `provider = "sqlite"` (no `url` in schema — URL is resolved via `prisma.config.ts`)
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

### Requirement: Database migration creates the Product table
Running `prisma migrate dev` SHALL create a new migration that generates the `Product` table in the SQLite database alongside the existing `User` table.

#### Scenario: Product migration succeeds
- **WHEN** the developer runs `prisma migrate dev --name add-products` from `apps/backend`
- **THEN** a migration SQL file is created under `prisma/migrations/` containing a `CREATE TABLE "Product"` statement
- **THEN** the `Product` table exists in `dev.db` with columns: `id`, `name`, `description`, `price`, `image`, `category`, `stock`, `createdAt`

#### Scenario: Existing User table is unchanged
- **WHEN** the product migration runs
- **THEN** the `User` table remains intact with all existing data preserved

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

### Requirement: Seed script populates sample products
The `apps/backend/prisma/seed.ts` script SHALL create sample products across at least 3 different categories with a minimum of 12 products total. Products SHALL be upserted (using a unique identifier) to allow idempotent re-runs.

#### Scenario: Seed creates sample products
- **WHEN** the developer runs `prisma db seed` from `apps/backend`
- **THEN** at least 12 products exist in the database
- **THEN** products span at least 3 different categories (e.g., "electronics", "clothing", "home")

#### Scenario: Products have realistic sample data
- **WHEN** inspecting seeded products
- **THEN** each product has a non-empty `name`, `description`, valid `price` in cents (> 0), a placeholder `image` URL, a `category` string, and `stock` >= 0

#### Scenario: Product seed is idempotent
- **WHEN** the developer runs `prisma db seed` multiple times
- **THEN** no duplicate products are created; existing products are updated in place
