## Context

The `@mfe/ui` package was scaffolded as an empty TypeScript package during the monorepo-foundation change. It currently exports nothing (`export {}`) and has no React, Tailwind, or shadcn dependencies. The `cn()` utility already lives in `@mfe/shared/src/utils.ts` (using `clsx` + `tailwind-merge`). All three frontend apps (host, storefront, account) declare `@mfe/ui: "workspace:*"` but have no CSS tooling configured — no Tailwind, no PostCSS, no `.css` files.

ADR-007 mandates shadcn/ui with Tailwind CSS v4. ADR-010 specifies `packages/*` as build-time packages consumed via `workspace:*`. The apps use Rsbuild v2 which has built-in PostCSS support.

## Goals / Non-Goals

**Goals:**

- Establish the Tailwind v4 design token system in `packages/ui/tailwind.css`
- Configure shadcn/ui CLI infrastructure (`components.json`) so future components can be added via `pnpm dlx shadcn@latest add`
- Ship 6 foundational components: Button, Card, Input, Label, Badge, Separator
- Wire Tailwind CSS PostCSS pipeline into all 3 frontend apps so they process `@mfe/ui` tokens and scan component classes
- Verify end-to-end: `turbo run build` succeeds for all packages and apps

**Non-Goals:**

- Form components (Field, FieldGroup, Select, Checkbox) — deferred to page-building phase
- Overlay/feedback components (Dialog, Sheet, Toast, Skeleton) — deferred
- Dark mode toggle UI or ThemeProvider — CSS tokens support dark mode but toggle is deferred
- Page layouts, routing, or actual feature UI in any app
- Storybook or visual regression testing

## Decisions

### D1: Source-first package with app-side CSS bundling

shadcn components are TSX files using Tailwind utility classes (strings, not CSS imports). `tsc` compiles them to JS+d.ts. The Tailwind CSS processing happens in the consuming app's Rsbuild build via PostCSS.

```
┌─────────────────────────────────────────────────────────────┐
│  packages/ui/ (build-time package)                          │
│                                                             │
│  src/components/*.tsx  ──tsc──▶  dist/components/*.js       │
│  (Tailwind classes are just strings — no CSS processing)    │
│                                                             │
│  tailwind.css          ──raw──▶  imported by apps' CSS      │
│  (@theme tokens)           (not processed by @mfe/ui)       │
└─────────────────────────────────────────────────────────────┘
        │                           │
        ▼                           ▼
┌─────────────────────────────────────────────────────────────┐
│  apps/host/ (or storefront, account)                        │
│                                                             │
│  src/app.css:                                               │
│    @import "tailwindcss";                                   │
│    @import "../../packages/ui/tailwind.css";                │
│    @source "../../packages/ui/src/**/*.{ts,tsx}";           │
│                                                             │
│  Rsbuild ──▶ PostCSS ──▶ @tailwindcss/postcss               │
│    scans app src/ + packages/ui/src/ for class usage        │
│    outputs bundled CSS with only used utilities              │
└─────────────────────────────────────────────────────────────┘
```

**Why not bundle CSS in `@mfe/ui` itself?** `tsc` cannot process CSS files. We'd need a second bundler (tsup, Vite lib mode) just for the package. Since Rsbuild already processes CSS via PostCSS in every app, letting each app handle its own Tailwind build is simpler, avoids duplicate tooling, and follows the same pattern other monorepo shadcn setups use. Each MFE gets its own CSS bundle — no shared CSS singleton needed at runtime (per tailwind-design-system skill: each app imports and builds its own token set).

**Alternative considered:** Using tsup or Vite library mode in `@mfe/ui` to emit bundled CSS alongside JS. Rejected because it adds a second build tool, complicates the dev watch pipeline, and produces a fixed CSS bundle that can't tree-shake unused utilities per app.

### D2: Direct `@theme` values in OKLCH (not `@theme inline` with CSS variable indirection)

Per tailwind-design-system skill, Tailwind v4 supports two patterns:
- **Direct**: `@theme { --color-primary: oklch(14.5% 0.025 264); }`
- **Indirect**: `:root { --primary: oklch(...); }` + `@theme inline { --color-primary: var(--primary); }`

We use **direct** for the initial setup. The indirect pattern is useful when external tools (CMS, JS runtime) need to override tokens via CSS variables. We don't have that need. Direct values are simpler, fewer files to maintain, and produce identical output.

**Alternative considered:** `@theme inline` with `:root` variables for runtime theme switching. Deferred — can migrate later if a runtime theme-switcher or user-customizable themes are needed.

### D3: React as peerDependency in `@mfe/ui`

`@mfe/ui` declares `react` and `react-dom` as `peerDependencies`, not `dependencies`. All consuming apps already have React 19 and Module Federation shares it as a singleton (ADR-005). Listing React as a peer dep:
- Prevents `pnpm` from installing a duplicate copy
- Makes the contract explicit: consumers provide React
- Follows the convention of component libraries (per vercel-composition-patterns skill)

### D4: `cn()` re-exported from `@mfe/shared`, not duplicated

The shared-package change established `cn()` in `@mfe/shared/src/utils.ts`. Per the design decision in that change (Decision 5), `@mfe/ui` re-exports it from `src/lib/utils.ts` for convenience. shadcn components within `@mfe/ui` import from `../lib/utils` (local relative path). Apps can import `cn` from either `@mfe/shared` or `@mfe/ui`.

### D5: Manual `components.json` for shadcn CLI (not `shadcn init`)

The shadcn CLI supports templates: `next`, `vite`, `react-router`, `astro`. Our bundler is **Rsbuild** — not in the list. Running `shadcn init --template vite` would scaffold files assuming Vite conventions. Instead, we hand-write `components.json` with correct paths:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "tailwind.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@mfe/ui/components",
    "ui": "@mfe/ui/components",
    "utils": "@mfe/ui/lib/utils",
    "lib": "@mfe/ui/lib",
    "hooks": "@mfe/ui/hooks"
  }
}
```

Then `pnpm dlx shadcn@latest add button card input label badge separator --cwd packages/ui` installs components using these paths. After installation, we review and fix imports per shadcn skill workflow (step 7: verify added files).

**Alternative considered:** `shadcn init --template vite --monorepo --cwd packages/ui`. Rejected because Rsbuild ≠ Vite; the init would create unnecessary config files and potentially misconfigure paths.

### D6: Per-app PostCSS config (not shared root-level config)

Each frontend app gets its own `postcss.config.js`:

```js
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

Rsbuild v2 auto-detects `postcss.config.js` in the app directory (per rsbuild-best-practices skill: built-in PostCSS support). No `tools.postcss` override needed in `rsbuild.config.ts`.

**Why per-app?** Each MFE builds independently. A root-level PostCSS config would require Rsbuild to resolve it from the app's working directory upward, which is fragile. Per-app configs are explicit and allow app-specific PostCSS plugins later.

### D7: Tailwind content scanning via `@source` directive

In Tailwind v4, content scanning is configured in CSS (not `tailwind.config.ts`). Each app's `src/app.css` uses `@source` to tell Tailwind where to find class names:

```css
@import "tailwindcss";
@import "../../packages/ui/tailwind.css";
@source "../../packages/ui/src/**/*.{ts,tsx}";
```

This ensures Tailwind includes utilities used in `@mfe/ui` components even though those files live outside the app's `src/` directory. The relative path resolves at build time from the CSS file's location.

### D8: New York style

Per shadcn skill, the `style` field determines the component aesthetic. We use:
- **style: `new-york`** — The established, widely-used shadcn style. Slightly more compact than the default style, with well-documented component variants. Chosen over `nova` (experimental) for stability and broader ecosystem support.

### D9: Component dependency graph

```
@mfe/tsconfig/react.json
        │
        ▼
@mfe/shared (cn, clsx, tailwind-merge)
        │
        ▼
@mfe/ui
├── src/lib/utils.ts         ← re-exports { cn } from @mfe/shared
├── src/components/button.tsx ← imports cn from ../lib/utils
├── src/components/card.tsx   ← imports cn from ../lib/utils
├── src/components/input.tsx  ← imports cn from ../lib/utils
├── src/components/label.tsx  ← imports cn from ../lib/utils
├── src/components/badge.tsx  ← imports cn from ../lib/utils
├── src/components/separator.tsx
├── tailwind.css              ← @theme tokens (consumed raw by apps)
└── src/index.ts              ← barrel re-exports all components + cn
        │
        ▼
apps/host, apps/storefront, apps/account
├── src/app.css               ← @import tailwindcss + tokens + @source
├── src/index.tsx              ← import "./app.css"
├── postcss.config.js          ← @tailwindcss/postcss
└── package.json               ← tailwindcss, @tailwindcss/postcss (devDeps)
```

### D10: No changes to Rsbuild config files

Rsbuild v2 has built-in PostCSS support and auto-detects `postcss.config.js`. No `tools.postcss` or plugin additions needed in any app's `rsbuild.config.ts`. The CSS entry is imported in `index.tsx`, which Rsbuild handles as part of the normal module graph.

## Risks / Trade-offs

**[Risk] shadcn CLI may not fully support Rsbuild monorepo paths**
→ Mitigation: After `shadcn add`, manually verify and fix import paths in generated component files. The CLI resolves aliases from `components.json`, but relative paths may need adjustment. Always review per shadcn skill step 7.

**[Risk] `@source` relative paths may break if app directory structure changes**
→ Mitigation: The relative path from `apps/<app>/src/app.css` to `packages/ui/src/` is stable (`../../packages/ui/src/`). Document this in CONVENTIONS.md if needed.

**[Risk] Tailwind CSS v4 + Rsbuild v2-beta version compatibility**
→ Mitigation: Pin `tailwindcss` to `^4.0.0` and `@tailwindcss/postcss` to `^4.0.0`. Rsbuild v2-beta's PostCSS support is stable (standard PostCSS loader). If issues arise, `rsbuild inspect` reveals the active PostCSS config.

**[Trade-off] Each app bundles its own copy of Tailwind CSS**
→ Acceptable: Each MFE runs independently. CSS deduplication across MFEs would require a shared CSS singleton via Module Federation, which adds complexity for marginal savings. Individual bundles are small (Tailwind v4 tree-shakes aggressively).

**[Trade-off] `tsc` build for `@mfe/ui` doesn't validate Tailwind classes**
→ Acceptable: Tailwind class validation only happens at CSS build time in the consuming app. Invalid classes result in missing styles, not build errors. This is standard for all Tailwind workflows.

## Open Questions

None — all critical decisions resolved during exploration. The approach is well-grounded in the skill files and existing architecture.
