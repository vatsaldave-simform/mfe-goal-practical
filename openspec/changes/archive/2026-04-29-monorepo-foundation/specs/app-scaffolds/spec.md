## ADDED Requirements

### Requirement: Host app is a bare Rsbuild + React 19 application
The `apps/host` application SHALL be a minimal Rsbuild application with React 19 that serves as the Module Federation consumer (shell app) on port 3000.

#### Scenario: Host app builds successfully
- **WHEN** the developer runs `turbo run build` and the build reaches `apps/host`
- **THEN** Rsbuild compiles the application into `dist/` with zero errors

#### Scenario: Host app dev server starts on port 3000
- **WHEN** the developer runs `turbo run dev` and the dev server for host starts
- **THEN** the host app is accessible at `http://localhost:3000` and renders a minimal React component

#### Scenario: Host app has Rsbuild config with MF plugin
- **WHEN** inspecting `apps/host/rsbuild.config.ts`
- **THEN** it imports and registers `pluginModuleFederation` from `@module-federation/rsbuild-plugin` using the MF config from `module-federation.config.ts`

#### Scenario: Host app entry point renders React 19
- **WHEN** inspecting `apps/host/src/index.tsx`
- **THEN** it creates a React 19 root using `createRoot` and renders a minimal `App` component

### Requirement: Storefront app is a bare Rsbuild + React 19 application
The `apps/storefront` application SHALL be a minimal Rsbuild application with React 19 that serves as a Module Federation provider on port 3001.

#### Scenario: Storefront app builds successfully
- **WHEN** the developer runs `turbo run build` and the build reaches `apps/storefront`
- **THEN** Rsbuild compiles the application into `dist/` with zero errors

#### Scenario: Storefront app dev server starts on port 3001
- **WHEN** the developer runs `turbo run dev` and the dev server for storefront starts
- **THEN** the storefront app is accessible at `http://localhost:3001` and renders a minimal React component

#### Scenario: Storefront app has Rsbuild config with MF plugin
- **WHEN** inspecting `apps/storefront/rsbuild.config.ts`
- **THEN** it imports and registers `pluginModuleFederation` from `@module-federation/rsbuild-plugin` using the MF config from `module-federation.config.ts`

### Requirement: Account app is a bare Rsbuild + React 19 application
The `apps/account` application SHALL be a minimal Rsbuild application with React 19 that serves as a Module Federation provider on port 3002.

#### Scenario: Account app builds successfully
- **WHEN** the developer runs `turbo run build` and the build reaches `apps/account`
- **THEN** Rsbuild compiles the application into `dist/` with zero errors

#### Scenario: Account app dev server starts on port 3002
- **WHEN** the developer runs `turbo run dev` and the dev server for account starts
- **THEN** the account app is accessible at `http://localhost:3002` and renders a minimal React component

#### Scenario: Account app has Rsbuild config with MF plugin
- **WHEN** inspecting `apps/account/rsbuild.config.ts`
- **THEN** it imports and registers `pluginModuleFederation` from `@module-federation/rsbuild-plugin` using the MF config from `module-federation.config.ts`

### Requirement: Backend app is a bare Express + TypeScript application
The `apps/backend` application SHALL be a minimal Express server written in TypeScript that listens on port 3003.

#### Scenario: Backend app compiles successfully
- **WHEN** the developer runs `turbo run build` and the build reaches `apps/backend`
- **THEN** `tsc` compiles `src/index.ts` into `dist/index.js` with zero errors

#### Scenario: Backend app dev server starts on port 3003
- **WHEN** the developer runs `turbo run dev` and the dev server for backend starts
- **THEN** the Express server starts on port 3003 using `tsx` for TypeScript execution with watch mode

#### Scenario: Backend app extends Node TypeScript config
- **WHEN** inspecting `apps/backend/tsconfig.json`
- **THEN** it extends `@mfe/tsconfig/node.json` and declares appropriate `outDir` and `include` settings

#### Scenario: Backend does not use Rsbuild or Module Federation
- **WHEN** inspecting `apps/backend/package.json` and its configuration files
- **THEN** there is no Rsbuild config, no Module Federation config, and no browser-related dependencies

### Requirement: All frontend apps declare shared package dependencies
Each frontend app (host, storefront, account) SHALL declare `@mfe/shared`, `@mfe/store`, `@mfe/api`, and `@mfe/ui` as `workspace:*` dependencies so the Turborepo `^build` graph is correct from the start.

#### Scenario: Frontend apps list all shared packages
- **WHEN** inspecting the `dependencies` field of each frontend app's `package.json`
- **THEN** each includes `"@mfe/shared": "workspace:*"`, `"@mfe/store": "workspace:*"`, `"@mfe/api": "workspace:*"`, and `"@mfe/ui": "workspace:*"`

#### Scenario: Turborepo builds shared packages before apps
- **WHEN** the developer runs `turbo run build`
- **THEN** all shared packages complete their build phase before any frontend app begins its Rsbuild build, because the `^build` dependency graph cascades through the declared `workspace:*` dependencies

### Requirement: Each app has a unique package name under @mfe scope
Every app SHALL have a unique `name` field in its `package.json` under the `@mfe` scope.

#### Scenario: App package names follow convention
- **WHEN** inspecting each app's `package.json`
- **THEN** host is named `@mfe/host`, storefront is named `@mfe/storefront`, account is named `@mfe/account`, and backend is named `@mfe/backend`
