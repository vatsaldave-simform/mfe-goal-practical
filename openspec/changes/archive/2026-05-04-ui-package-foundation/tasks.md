## 1. Package Dependencies & Infrastructure

> **Skills to load**: shadcn, tailwind-design-system, turborepo

- [x] 1.1 Update `packages/ui/package.json`: add `react` and `react-dom` (`^19.0.0`) as `peerDependencies`; add `@radix-ui/react-slot`, `class-variance-authority`, `lucide-react`, and `@mfe/shared` (`workspace:*`) as `dependencies`
- [x] 1.2 Create `packages/ui/components.json` with shadcn CLI configuration: `base: "radix"`, `style: "nova"`, `rsc: false`, `tsx: true`, `iconLibrary: "lucide"`, Tailwind v4 CSS path pointing to `tailwind.css`, and aliases pointing to `@mfe/ui/` paths
- [x] 1.3 Create `packages/ui/src/lib/utils.ts` that re-exports `cn` from `@mfe/shared`
- [x] 1.4 Run `pnpm install` from repo root to resolve new workspace dependencies

## 2. Design Tokens

> **Skills to load**: tailwind-design-system

- [x] 2.1 Create `packages/ui/tailwind.css` with `@import "tailwindcss"` and `@theme` block defining semantic color tokens in OKLCH (background, foreground, primary, secondary, muted, accent, destructive, border, ring, card + foreground pairs, ring-offset)
- [x] 2.2 Add radius tokens (`--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`) to the `@theme` block
- [x] 2.3 Add animation tokens (`--animate-fade-in`, `--animate-fade-out`, `--animate-slide-in`, `--animate-slide-out`) with `@keyframes` inside `@theme`
- [x] 2.4 Add `@custom-variant dark (&:where(.dark, .dark *))` and `.dark {}` block with dark-mode OKLCH color overrides
- [x] 2.5 Add `@layer base` block applying `border-border` to all elements and `bg-background text-foreground antialiased` to body

## 3. Core Components

> **Skills to load**: shadcn, vercel-composition-patterns

- [x] 3.1 Add Button component to `packages/ui/src/components/button.tsx` using shadcn CLI (`pnpm dlx shadcn@latest add button --cwd packages/ui`) — review output and fix imports to use `../lib/utils` for `cn` and verify React 19 ref pattern (no `forwardRef`)
- [x] 3.2 Add Card compound component to `packages/ui/src/components/card.tsx` using shadcn CLI (`pnpm dlx shadcn@latest add card --cwd packages/ui`) — review and verify exports: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- [x] 3.3 Add Input component to `packages/ui/src/components/input.tsx` using shadcn CLI (`pnpm dlx shadcn@latest add input --cwd packages/ui`) — review focus ring and disabled state styling
- [x] 3.4 Add Label component to `packages/ui/src/components/label.tsx` using shadcn CLI (`pnpm dlx shadcn@latest add label --cwd packages/ui`) — review peer-disabled styling
- [x] 3.5 Add Badge component to `packages/ui/src/components/badge.tsx` using shadcn CLI (`pnpm dlx shadcn@latest add badge --cwd packages/ui`) — verify variants: default, secondary, destructive, outline
- [x] 3.6 Add Separator component to `packages/ui/src/components/separator.tsx` using shadcn CLI (`pnpm dlx shadcn@latest add separator --cwd packages/ui`) — verify horizontal/vertical orientation support

## 4. Barrel Exports

> **Skills to load**: shadcn, turborepo

- [x] 4.1 Update `packages/ui/src/index.ts` to re-export all components from `./components/button`, `./components/card`, `./components/input`, `./components/label`, `./components/badge`, `./components/separator`, and `cn` from `./lib/utils`
- [x] 4.2 Verify `tsc` build of `@mfe/ui` succeeds: run `pnpm --filter @mfe/ui build` and confirm `dist/` contains compiled JS + d.ts for all components

## 5. App Tailwind Wiring — Host

> **Skills to load**: tailwind-design-system, rsbuild-best-practices

- [x] 5.1 Add `tailwindcss` (v4) and `@tailwindcss/postcss` (v4) as `devDependencies` in `apps/host/package.json`
- [x] 5.2 Create `apps/host/postcss.config.js` with `@tailwindcss/postcss` plugin
- [x] 5.3 Create `apps/host/src/app.css` with `@import "tailwindcss"`, `@import` of `packages/ui/tailwind.css` tokens (relative path), and `@source` directive pointing to `packages/ui/src/**/*.{ts,tsx}`
- [x] 5.4 Add `import "./app.css"` to `apps/host/src/index.tsx`

## 6. App Tailwind Wiring — Storefront

> **Skills to load**: tailwind-design-system, rsbuild-best-practices

- [x] 6.1 Add `tailwindcss` (v4) and `@tailwindcss/postcss` (v4) as `devDependencies` in `apps/storefront/package.json`
- [x] 6.2 Create `apps/storefront/postcss.config.js` with `@tailwindcss/postcss` plugin
- [x] 6.3 Create `apps/storefront/src/app.css` with `@import "tailwindcss"`, `@import` of `packages/ui/tailwind.css` tokens (relative path), and `@source` directive pointing to `packages/ui/src/**/*.{ts,tsx}`
- [x] 6.4 Add `import "./app.css"` to `apps/storefront/src/index.tsx`

## 7. App Tailwind Wiring — Account

> **Skills to load**: tailwind-design-system, rsbuild-best-practices

- [x] 7.1 Add `tailwindcss` (v4) and `@tailwindcss/postcss` (v4) as `devDependencies` in `apps/account/package.json`
- [x] 7.2 Create `apps/account/postcss.config.js` with `@tailwindcss/postcss` plugin
- [x] 7.3 Create `apps/account/src/app.css` with `@import "tailwindcss"`, `@import` of `packages/ui/tailwind.css` tokens (relative path), and `@source` directive pointing to `packages/ui/src/**/*.{ts,tsx}`
- [x] 7.4 Add `import "./app.css"` to `apps/account/src/index.tsx`

## 8. Install & Build Verification

> **Skills to load**: turborepo, rsbuild-best-practices

- [x] 8.1 Run `pnpm install` from repo root to resolve all new dependencies
- [x] 8.2 Run `turbo run build` from repo root and verify all packages and apps build with zero errors
- [x] 8.3 Verify `packages/ui/dist/` contains compiled JS + d.ts for all components, lib/utils, and index
