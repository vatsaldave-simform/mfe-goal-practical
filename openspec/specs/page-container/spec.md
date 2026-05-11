## ADDED Requirements

### Requirement: PageContainer component exists in packages/ui

A `PageContainer` component is exported from `@mfe/ui` that provides a centered, max-width-bounded layout column for page-level content.

#### Scenario: PageContainer constrains content width

- **WHEN** any page or skeleton is rendered inside `PageContainer`
- **THEN** the content is horizontally centered and does not exceed `max-w-6xl` (72rem)

#### Scenario: PageContainer fills available height

- **WHEN** `PageContainer` is used inside `ShellLayout`'s `<main>`
- **THEN** it does not collapse vertically — content-driven height flows naturally

#### Scenario: PageContainer provides horizontal padding

- **WHEN** viewport is narrower than max-width
- **THEN** `PageContainer` provides consistent horizontal padding so content does not touch viewport edges
