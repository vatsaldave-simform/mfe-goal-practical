## MODIFIED Requirements

### Requirement: @mfe/ui is a buildable package scaffold
The `packages/ui` package SHALL be a buildable TypeScript package that extends the React TypeScript config, with shadcn/ui infrastructure, Tailwind CSS v4 design tokens, and core component dependencies.

#### Scenario: Package compiles successfully
- **WHEN** the developer runs `turbo run build` and the build reaches `@mfe/ui`
- **THEN** `tsc` compiles all files under `src/` (including `components/`, `lib/`) into `dist/` with zero errors

#### Scenario: Package extends React TypeScript config
- **WHEN** inspecting `packages/ui/tsconfig.json`
- **THEN** it extends `@mfe/tsconfig/react.json` because it contains React components

#### Scenario: Package exports are configured correctly
- **WHEN** another package or app imports from `@mfe/ui`
- **THEN** the import resolves through `main: "./dist/index.js"` and `types: "./dist/index.d.ts"`

#### Scenario: Package declares React as a peer dependency
- **WHEN** inspecting `packages/ui/package.json`
- **THEN** `react` and `react-dom` are listed in `peerDependencies` (not `dependencies`) with `^19.0.0`

#### Scenario: Package declares component library dependencies
- **WHEN** inspecting `packages/ui/package.json`
- **THEN** it lists `@radix-ui/react-slot`, `class-variance-authority`, and `lucide-react` in `dependencies`, and `@mfe/shared` as `"workspace:*"` in `dependencies`

#### Scenario: Package has shadcn components.json configuration
- **WHEN** inspecting `packages/ui/components.json`
- **THEN** it contains a valid shadcn configuration with `base: "radix"`, `rsc: false`, `tsx: true`, icon library set to `lucide`, and aliases pointing to `@mfe/ui/` paths

#### Scenario: Package has src/lib/utils.ts re-exporting cn
- **WHEN** inspecting `packages/ui/src/lib/utils.ts`
- **THEN** it re-exports the `cn` function from `@mfe/shared`

#### Scenario: Package has tailwind.css with design tokens
- **WHEN** inspecting `packages/ui/tailwind.css`
- **THEN** it contains a Tailwind v4 `@theme` block with OKLCH semantic color tokens, radius tokens, and animation tokens

#### Scenario: Package has src/components/ directory with component files
- **WHEN** listing `packages/ui/src/components/`
- **THEN** it contains `button.tsx`, `card.tsx`, `input.tsx`, `label.tsx`, `badge.tsx`, and `separator.tsx`
