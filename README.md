# MFE Goal Practical

A full-stack e-commerce application built as **Microfrontends** for learning and practical demonstration purposes. The entire project is developed using an **AI-driven OpenSpec workflow**, with incremental feature delivery across independently deployable frontend apps orchestrated by a single host shell.

> **More features are being added incrementally** — this is an evolving project with continuous improvements planned.

---

## Live Links

| App | URL |
|---|---|
| Host (Shell) | https://mfe-goal-practical-host.vercel.app/ |
| Account MFE | https://mfe-goal-practical-account.vercel.app/ |
| Storefront MFE | https://mfe-goal-practical-storefront.vercel.app/ |
| Backend API | https://mfe-goal-practical.onrender.com |

---

## What It Is

A practical e-commerce platform featuring:

- **Product browsing** — list and detail pages for products
- **Shopping cart** — add/remove items, cart badge sync across MFEs
- **Authentication** — JWT-based login and registration
- **Account management** — user profile page
- **Orders** — order listing and order detail views

---

## Architecture

### Microfrontend Pattern

This project uses **Module Federation v2** to split the frontend into independently deployable apps. The **host** acts as the shell — it owns the router, layout, and auth guard, then lazily loads remote UI from the storefront and account MFEs at runtime.

```
┌──────────────────────────────────────────────────────────┐
│                     Host (Shell)                         │
│  BrowserRouter + Shell Layout + Auth Guard               │
│                                                          │
│   ┌──────────────────┐   ┌───────────────────────────┐  │
│   │  Storefront MFE  │   │       Account MFE         │  │
│   │  (remote)        │   │       (remote)            │  │
│   │                  │   │                           │  │
│   │  ./App           │   │  ./AuthApp  (login/reg)   │  │
│   │  ./ProductApp    │   │  ./App      (profile)     │  │
│   │  ./CartApp       │   │  ./OrdersApp (orders)     │  │
│   └──────────────────┘   └───────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                           │
                    REST API (Express)
                    PostgreSQL (Neon)
```

### Key Architecture Decisions

| Concern | Approach |
|---|---|
| **Runtime integration** | Module Federation v2 — MFEs are loaded at runtime, not bundled into the host |
| **Routing** | Host owns `BrowserRouter`; MFEs use relative `<Routes>` mounted at path prefixes |
| **Shared state** | Zustand store (`@mfe/store`) shared as a singleton via MF shared config |
| **Server state** | TanStack Query (`@mfe/api`) shared as a singleton across all MFEs |
| **Build-time sharing** | `packages/*` consumed via pnpm `workspace:*` for types, utils, UI components |
| **Auth** | JWT stored in HTTP-only cookies; `auth` slice in Zustand for UI state |

---

## Monorepo Structure

```
mfe-goal-practical/
├── apps/
│   ├── host/          ← Shell app — MF consumer, routing, layout, auth guard
│   ├── storefront/    ← Products + Cart MFE — MF provider
│   ├── account/       ← Auth + Profile + Orders MFE — MF provider
│   └── backend/       ← Express REST API + Prisma + PostgreSQL
│
└── packages/
    ├── api/           ← @mfe/api — axios client + TanStack Query hooks
    ├── store/         ← @mfe/store — Zustand slices (auth, cart)
    ├── shared/        ← @mfe/shared — shared types, schemas, constants, utils
    ├── ui/            ← @mfe/ui — shadcn/ui component library + design tokens
    └── tsconfig/      ← @mfe/tsconfig — shared TypeScript configs
```

---

## Tech Stack

### Frontend

| Layer | Technology |
|---|---|
| Bundler | [Rsbuild](https://rsbuild.dev/) |
| MF Runtime | [Module Federation v2](https://module-federation.io/) |
| Language | TypeScript (strict) |
| UI Framework | React 19 |
| Routing | React Router v7 |
| State | Zustand v5 |
| Server State | TanStack Query (React Query) |
| Forms | React Hook Form + Zod |
| Styling | Tailwind CSS v4 (CSS-first `@theme`) |
| Components | shadcn/ui |
| Icons | Lucide React |
| Notifications | Sonner |

### Backend

| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express |
| ORM | Prisma |
| Database | PostgreSQL (Neon serverless) |
| Auth | JWT + bcryptjs + HTTP-only cookies |
| Validation | Zod |

### Monorepo Tooling

| Tool | Purpose |
|---|---|
| [Turborepo](https://turbo.build/) | Task orchestration + caching |
| [pnpm workspaces](https://pnpm.io/workspaces) | Package management |

---

## Dev Server Ports

| App | Port |
|---|---|
| Host | 3000 |
| Storefront | 3001 |
| Account | 3002 |
| Backend | 3003 |

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+

### Install dependencies

```bash
pnpm install
```

### Environment variables

Create `.env` files in the relevant apps:

**`apps/backend/.env`**
```env
DATABASE_URL=<your-postgres-connection-string>
JWT_SECRET=<your-jwt-secret>
PORT=3003
```

**`apps/host/.env`** (optional, defaults to localhost)
```env
PUBLIC_API_URL=http://localhost:3003
STOREFRONT_URL=http://localhost:3001
ACCOUNT_URL=http://localhost:3002
```

### Run all apps in development

```bash
pnpm dev
```

This starts all apps concurrently via Turborepo. The host shell at `http://localhost:3000` will load storefront and account remotes dynamically.

### Build all apps

```bash
pnpm build
```

### Database setup (backend)

```bash
cd apps/backend
pnpm db:migrate   # run Prisma migrations
pnpm db:seed      # seed initial data
```

---

## Module Federation — How It Works

1. **Storefront** (port 3001) and **Account** (port 3002) each serve an `mf-manifest.json` that describes their exposed modules.
2. **Host** (port 3000) declares these as remotes in `module-federation.config.ts`, resolving URLs from environment variables with localhost fallbacks.
3. At runtime, the host lazily loads remote components via `React.lazy()` wrapped in `<Suspense>` and an error boundary.
4. Singleton packages (`react`, `react-dom`, `react-router`, `zustand`, `@mfe/store`, `@mfe/api`, `sonner`) are shared across all MFEs — only one instance runs in the browser.

---

## Deployment

| App | Platform |
|---|---|
| Host, Account, Storefront | [Vercel](https://vercel.com/) |
| Backend | [Render](https://render.com/) |
| Database | [Neon](https://neon.tech/) (serverless PostgreSQL) |

Each frontend app has its own `vercel.json` and is deployed independently. MF remote URLs are injected at build time via environment variables (`STOREFRONT_URL`, `ACCOUNT_URL`, `PUBLIC_API_URL`).

---

## Roadmap

The project is being built incrementally. Planned and in-progress additions include:

- [ ] Checkout flow and order placement
- [ ] Toast notification system
- [ ] Enhanced cart UX and persistence
- [ ] More robust error handling and loading states
- [ ] Additional account features
- [ ] Performance optimisations and bundle analysis

---

## Project Methodology

This project is developed using the **OpenSpec workflow** — a structured, AI-assisted approach where every feature goes through:

1. **Proposal** — problem statement and capability overview
2. **Spec** — acceptance criteria with BDD-style scenarios
3. **Tasks** — granular implementation checklist
4. **Implementation** — code authored by AI agents
5. **Verification** — specs checked against implementation
6. **Archive** — completed changes stored in `openspec/changes/archive/`

All specs and change history live in the [`openspec/`](./openspec/) directory.
