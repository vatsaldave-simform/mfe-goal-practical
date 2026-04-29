## ADDED Requirements

### Requirement: CONVENTIONS.md exists at repository root
The repository SHALL contain a `CONVENTIONS.md` file at the root that codifies development rules, naming conventions, and AI development guidelines for all future changes.

#### Scenario: CONVENTIONS.md is present
- **WHEN** the developer inspects the repository root
- **THEN** a `CONVENTIONS.md` file exists alongside `turbo.json`, `pnpm-workspace.yaml`, and `package.json`

### Requirement: Naming conventions are documented
The `CONVENTIONS.md` SHALL document naming conventions for packages, apps, files, and exports used throughout the monorepo.

#### Scenario: Package scope convention is specified
- **WHEN** a developer reads the naming conventions section
- **THEN** it states that all packages and apps use the `@mfe/` scope prefix (e.g., `@mfe/shared`, `@mfe/host`)

#### Scenario: File naming convention is specified
- **WHEN** a developer reads the naming conventions section
- **THEN** it specifies kebab-case for file names, PascalCase for React component files, and the expected file extensions (`.ts`, `.tsx`)

### Requirement: File organization rules are documented
The `CONVENTIONS.md` SHALL document the expected folder structure and where different types of code belong.

#### Scenario: App vs package boundary is specified
- **WHEN** a developer reads the file organization section
- **THEN** it specifies that `apps/` contains deployable applications and `packages/` contains shared libraries, and describes what belongs in each

#### Scenario: MFE-specific vs shared component boundary is specified
- **WHEN** a developer reads the file organization section
- **THEN** it specifies that MFE-specific components stay in the MFE app and only shared/reusable components belong in `packages/ui`

### Requirement: State management boundaries are documented
The `CONVENTIONS.md` SHALL codify the state management strategy from ADR-002, specifying what belongs in Zustand, TanStack Query, and local React state.

#### Scenario: Zustand scope is defined
- **WHEN** a developer reads the state management section
- **THEN** it states that Zustand holds ONLY global auth state (`isAuthenticated`, `user`) and cart state (`itemCount`), and explicitly prohibits server-fetched data, form state, or JWT tokens in Zustand

#### Scenario: Server state guidance is defined
- **WHEN** a developer reads the state management section
- **THEN** it states that all API data (products, cart contents, orders) SHALL be managed by TanStack Query, never duplicated in Zustand

#### Scenario: Local state guidance is defined
- **WHEN** a developer reads the state management section
- **THEN** it states that form inputs, UI toggles, modals, search/filter state, and pagination SHALL use React `useState` or React Hook Form

### Requirement: AI development guidelines are documented
The `CONVENTIONS.md` SHALL include guidelines for AI-driven development, ensuring consistent and predictable code generation across all future changes.

#### Scenario: OpenSpec workflow reference is included
- **WHEN** a developer reads the AI development section
- **THEN** it references the OpenSpec workflow and states that all changes go through the proposal → specs → design → tasks pipeline

#### Scenario: Skill usage guidance is included
- **WHEN** a developer reads the AI development section
- **THEN** it states that the relevant `.agents/skills/` SKILL.md files MUST be read before implementing in any domain (turborepo, MF, shadcn, etc.)

### Requirement: Import and dependency rules are documented
The `CONVENTIONS.md` SHALL document rules for importing between packages and apps to prevent circular dependencies and phantom imports.

#### Scenario: Workspace dependency rule is specified
- **WHEN** a developer reads the import rules section
- **THEN** it states that all inter-package dependencies MUST be declared as `"workspace:*"` in `package.json` and SHALL NOT rely on hoisting

#### Scenario: API usage rule is specified
- **WHEN** a developer reads the import rules section
- **THEN** it states that all MFE apps MUST use `@mfe/api` for data fetching and SHALL NOT create direct axios instances or fetch calls
