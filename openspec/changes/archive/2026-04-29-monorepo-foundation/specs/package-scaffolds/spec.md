## ADDED Requirements

### Requirement: @mfe/tsconfig provides shared TypeScript configurations
The `packages/tsconfig` package SHALL provide three shared configuration files — `base.json`, `react.json`, and `node.json` — that all other packages and apps extend.

#### Scenario: base.json defines strict shared compiler settings
- **WHEN** a package or app extends `@mfe/tsconfig/base.json`
- **THEN** it inherits `strict: true`, `skipLibCheck: true`, `moduleResolution: "bundler"`, `target: "ES2022"`, `module: "ESNext"`, `declaration: true`, `declarationMap: true`, and `composite: true`

#### Scenario: react.json extends base with JSX and DOM support
- **WHEN** a React app or package extends `@mfe/tsconfig/react.json`
- **THEN** it inherits all `base.json` settings plus JSX transform configuration and DOM/DOM.Iterable lib entries

#### Scenario: node.json extends base with Node.js types
- **WHEN** the backend app extends `@mfe/tsconfig/node.json`
- **THEN** it inherits all `base.json` settings plus Node.js type definitions

#### Scenario: tsconfig package has no build step
- **WHEN** the developer runs `turbo run build`
- **THEN** `@mfe/tsconfig` has no build script because it contains only static JSON configuration files

### Requirement: @mfe/shared is a buildable package scaffold
The `packages/shared` package SHALL be a minimal but buildable TypeScript package that compiles `src/` to `dist/` using `tsc`.

#### Scenario: Package compiles successfully
- **WHEN** the developer runs `turbo run build` and the build reaches `@mfe/shared`
- **THEN** `tsc` compiles `src/index.ts` into `dist/index.js` and `dist/index.d.ts` with zero errors

#### Scenario: Package exports are configured correctly
- **WHEN** another package declares `"@mfe/shared": "workspace:*"` as a dependency
- **THEN** the consuming package resolves the import through `main: "./dist/index.js"` and `types: "./dist/index.d.ts"` as declared in `package.json` exports

#### Scenario: Package extends shared TypeScript config
- **WHEN** inspecting `packages/shared/tsconfig.json`
- **THEN** it extends `@mfe/tsconfig/react.json` and declares `outDir: "./dist"` and `include: ["src"]`

### Requirement: @mfe/store is a buildable package scaffold
The `packages/store` package SHALL be a minimal but buildable TypeScript package with a dependency on `@mfe/shared`.

#### Scenario: Package compiles successfully
- **WHEN** the developer runs `turbo run build` and the build reaches `@mfe/store`
- **THEN** `tsc` compiles `src/index.ts` into `dist/index.js` and `dist/index.d.ts` with zero errors

#### Scenario: Package declares dependency on @mfe/shared
- **WHEN** inspecting `packages/store/package.json`
- **THEN** it lists `"@mfe/shared": "workspace:*"` in its dependencies so the `^build` graph ensures `@mfe/shared` builds first

#### Scenario: Package exports are configured correctly
- **WHEN** another package or app imports from `@mfe/store`
- **THEN** the import resolves through `main: "./dist/index.js"` and `types: "./dist/index.d.ts"`

### Requirement: @mfe/api is a buildable package scaffold
The `packages/api` package SHALL be a minimal but buildable TypeScript package with a dependency on `@mfe/shared`.

#### Scenario: Package compiles successfully
- **WHEN** the developer runs `turbo run build` and the build reaches `@mfe/api`
- **THEN** `tsc` compiles `src/index.ts` into `dist/index.js` and `dist/index.d.ts` with zero errors

#### Scenario: Package declares dependency on @mfe/shared
- **WHEN** inspecting `packages/api/package.json`
- **THEN** it lists `"@mfe/shared": "workspace:*"` in its dependencies so the `^build` graph ensures `@mfe/shared` builds first

#### Scenario: Package exports are configured correctly
- **WHEN** another package or app imports from `@mfe/api`
- **THEN** the import resolves through `main: "./dist/index.js"` and `types: "./dist/index.d.ts"`

### Requirement: @mfe/ui is a buildable package scaffold
The `packages/ui` package SHALL be a minimal but buildable TypeScript package that extends the React TypeScript config.

#### Scenario: Package compiles successfully
- **WHEN** the developer runs `turbo run build` and the build reaches `@mfe/ui`
- **THEN** `tsc` compiles `src/index.ts` into `dist/index.js` and `dist/index.d.ts` with zero errors

#### Scenario: Package extends React TypeScript config
- **WHEN** inspecting `packages/ui/tsconfig.json`
- **THEN** it extends `@mfe/tsconfig/react.json` because it will contain React components

#### Scenario: Package exports are configured correctly
- **WHEN** another package or app imports from `@mfe/ui`
- **THEN** the import resolves through `main: "./dist/index.js"` and `types: "./dist/index.d.ts"`

### Requirement: All shared packages follow consistent compilation strategy
Every shared package (`@mfe/shared`, `@mfe/store`, `@mfe/api`, `@mfe/ui`) SHALL compile from `src/` to `dist/` using `tsc` and declare consistent `exports`, `main`, and `types` fields in their `package.json`.

#### Scenario: Consistent build script across all packages
- **WHEN** inspecting the `build` script in each shared package's `package.json`
- **THEN** each declares `"build": "tsc --project tsconfig.json"` as the build command

#### Scenario: Consistent dev script for watch mode
- **WHEN** inspecting the `dev` script in each shared package's `package.json`
- **THEN** each declares `"dev": "tsc --watch --project tsconfig.json"` for incremental compilation during development

#### Scenario: Each package has a minimal src/index.ts
- **WHEN** inspecting each shared package's source directory
- **THEN** each contains at least `src/index.ts` that exports an empty object or placeholder comment, ensuring the build produces valid output
