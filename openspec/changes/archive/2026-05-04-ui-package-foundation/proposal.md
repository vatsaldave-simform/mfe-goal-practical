## Why

The `@mfe/ui` package is currently an empty scaffold (`export {}`) with no React, Tailwind, or shadcn dependencies. Every spec referencing UI components — product cards, cart items, auth forms — depends on a functioning design system that does not yet exist. Until `@mfe/ui` ships real components with design tokens and Tailwind CSS wiring into the apps, no frontend feature work can produce a consistent, styled UI. This change establishes the design system foundation: Tailwind CSS v4 tokens, shadcn/ui component infrastructure, a starter set of core components, and the PostCSS pipeline in all three frontend apps.

## What Changes

- **Design tokens**: Create `packages/ui/tailwind.css` with Tailwind v4 `@theme` block defining semantic color tokens (OKLCH), radius, and animation tokens, plus dark-mode overrides via `@custom-variant dark` and `.dark` class.
- **Package dependencies**: Add `react` (peer), `@radix-ui/react-slot`, `class-variance-authority` as runtime deps; add `@mfe/shared` as workspace dep (for `cn()` re-export).
- **shadcn infrastructure**: Create `components.json` in `packages/ui` configured for radix base, Tailwind v4, and monorepo alias paths. Create `src/lib/utils.ts` re-exporting `cn()` from `@mfe/shared`.
- **Core components**: Add foundational shadcn components — Button, Card (compound: Header/Title/Description/Content/Footer), Input, Label, Badge, Separator — via `shadcn add` CLI into `packages/ui/src/components/`.
- **Barrel exports**: Update `packages/ui/src/index.ts` to export all components and utils.
- **App CSS wiring**: Install `tailwindcss` (v4) and `@tailwindcss/postcss` in all three frontend apps (host, storefront, account). Create per-app `postcss.config.js` and `src/app.css` that imports Tailwind, the shared tokens from `@mfe/ui`, and `@source` scans `packages/ui/src/` for class usage. Import `app.css` in each app's `index.tsx`.
- **Build verification**: Confirm `tsc` build of `@mfe/ui` succeeds and all three apps build with Rsbuild picking up PostCSS/Tailwind automatically.

## Non-goals

- Adding form-specific components (Field, FieldGroup, Select, Checkbox) — those come in a follow-up change when page building begins.
- Adding overlay/feedback components (Dialog, Sheet, Toast, Skeleton) — deferred to when features need them.
- Building actual pages or layouts in any app — this change only wires the design system infrastructure.
- Adding Tailwind to the backend app — it's an Express API with no UI.
- Dark mode toggle component or ThemeProvider — the CSS tokens support dark mode but the toggle UI is deferred.

## Capabilities

### New Capabilities

- `ui-design-tokens`: Tailwind CSS v4 `@theme` design tokens (semantic colors in OKLCH, radius, animations) and dark-mode overrides in `packages/ui/tailwind.css`.
- `ui-core-components`: shadcn/ui foundational components (Button, Card, Input, Label, Badge, Separator) in `packages/ui/src/components/` with CVA variants and Radix primitives.
- `ui-app-tailwind-wiring`: Tailwind CSS v4 PostCSS pipeline configured in all three frontend apps (host, storefront, account) with shared token import and content source scanning of `@mfe/ui`.

### Modified Capabilities

- `package-scaffolds`: `@mfe/ui` gains real dependencies (react peer dep, @radix-ui/react-slot, class-variance-authority, @mfe/shared), `components.json`, `src/lib/utils.ts`, and `src/components/` directory. The package.json exports remain `dist/`-based but the package is no longer an empty placeholder.

## Impact

- **packages/ui**: Transforms from empty scaffold to functional design system package. New files: `tailwind.css`, `components.json`, `src/lib/utils.ts`, `src/components/*.tsx`, updated `src/index.ts` and `package.json`.
- **apps/host, apps/storefront, apps/account**: Each gains `tailwindcss` + `@tailwindcss/postcss` devDependencies, a `postcss.config.js`, and `src/app.css`. Each `src/index.tsx` adds a CSS import. Rsbuild configs unchanged (PostCSS is auto-detected).
- **Turborepo pipeline**: No `turbo.json` changes needed — `@mfe/ui` already has a `build` script in the `^build` graph.
- **Dependencies (new npm packages)**: `tailwindcss` (v4), `@tailwindcss/postcss`, `@radix-ui/react-slot`, `class-variance-authority`, `lucide-react` (icon library for shadcn).

## Skills

- **shadcn** — Component installation, `components.json` config, composition rules, CLI workflow
- **tailwind-design-system** — Tailwind v4 `@theme` tokens, OKLCH colors, dark mode, CVA patterns
- **rsbuild-best-practices** — PostCSS integration, build verification, asset management
- **turborepo** — Workspace dependency graph, build ordering
- **vercel-composition-patterns** — Compound component API design (Card, future components)
