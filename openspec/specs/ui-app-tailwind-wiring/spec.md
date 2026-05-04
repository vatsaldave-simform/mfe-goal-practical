## ADDED Requirements

### Requirement: Each frontend app has a Tailwind CSS v4 PostCSS pipeline
Each frontend app (host, storefront, account) SHALL have `tailwindcss` and `@tailwindcss/postcss` installed as devDependencies and a `postcss.config.js` configuring the `@tailwindcss/postcss` plugin.

#### Scenario: PostCSS config exists in each frontend app
- **WHEN** inspecting `apps/host/postcss.config.js`, `apps/storefront/postcss.config.js`, and `apps/account/postcss.config.js`
- **THEN** each exports a config object with `@tailwindcss/postcss` as a plugin

#### Scenario: Tailwind dependencies are installed in each frontend app
- **WHEN** inspecting the `devDependencies` of each frontend app's `package.json`
- **THEN** each includes `"tailwindcss"` (v4) and `"@tailwindcss/postcss"` (v4)

### Requirement: Each frontend app has a CSS entry file importing Tailwind and @mfe/ui tokens
Each frontend app SHALL have a `src/app.css` file that imports Tailwind CSS, the shared design tokens from `@mfe/ui`, and declares a `@source` directive for scanning `packages/ui/src/` classes.

#### Scenario: App CSS imports Tailwind and shared tokens
- **WHEN** inspecting `apps/host/src/app.css` (and similarly for storefront and account)
- **THEN** it contains `@import "tailwindcss"`, an import of the `packages/ui/tailwind.css` tokens file, and a `@source` directive pointing to `packages/ui/src/**/*.{ts,tsx}`

#### Scenario: Rsbuild processes CSS without config changes
- **WHEN** the developer runs `rsbuild build` in any frontend app
- **THEN** Rsbuild auto-detects the `postcss.config.js` and processes `app.css` through PostCSS with the `@tailwindcss/postcss` plugin, requiring zero changes to `rsbuild.config.ts`

### Requirement: Each frontend app entry point imports the CSS file
Each frontend app's `src/index.tsx` SHALL import `./app.css` so the CSS is included in the build output.

#### Scenario: CSS import exists in each app entry
- **WHEN** inspecting `apps/host/src/index.tsx`, `apps/storefront/src/index.tsx`, and `apps/account/src/index.tsx`
- **THEN** each contains `import "./app.css"` before the React render call

### Requirement: Full build succeeds with Tailwind CSS pipeline
Running `turbo run build` SHALL complete successfully for all packages and all frontend apps with the Tailwind CSS pipeline active.

#### Scenario: Build succeeds end-to-end
- **WHEN** the developer runs `turbo run build` from the repository root
- **THEN** `@mfe/shared` builds, then `@mfe/ui` builds (tsc), then all three frontend apps build via Rsbuild with PostCSS/Tailwind processing, all with zero errors
