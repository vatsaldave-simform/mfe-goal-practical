## ADDED Requirements

### Requirement: @mfe/ui provides semantic color tokens via Tailwind v4 @theme
The `packages/ui/tailwind.css` file SHALL define semantic color tokens using Tailwind CSS v4's CSS-first `@theme` block with OKLCH color values. All token names SHALL follow the shadcn semantic naming convention (primary, secondary, muted, accent, destructive, background, foreground, card, border, ring).

#### Scenario: Light mode tokens are defined in @theme
- **WHEN** inspecting `packages/ui/tailwind.css`
- **THEN** it contains `@import "tailwindcss"` followed by a `@theme { }` block defining `--color-background`, `--color-foreground`, `--color-primary`, `--color-primary-foreground`, `--color-secondary`, `--color-secondary-foreground`, `--color-muted`, `--color-muted-foreground`, `--color-accent`, `--color-accent-foreground`, `--color-destructive`, `--color-destructive-foreground`, `--color-border`, `--color-ring`, `--color-card`, `--color-card-foreground`, and `--color-ring-offset` with OKLCH values

#### Scenario: Dark mode tokens override via .dark class
- **WHEN** inspecting `packages/ui/tailwind.css`
- **THEN** it contains a `.dark { }` block that overrides each semantic color variable with dark-appropriate OKLCH values

#### Scenario: Dark mode variant is configured
- **WHEN** inspecting `packages/ui/tailwind.css`
- **THEN** it contains `@custom-variant dark (&:where(.dark, .dark *))` enabling class-based dark mode

### Requirement: @mfe/ui provides radius tokens
The `packages/ui/tailwind.css` SHALL define border-radius tokens in the `@theme` block.

#### Scenario: Radius scale is defined
- **WHEN** inspecting the `@theme` block in `packages/ui/tailwind.css`
- **THEN** it defines `--radius-sm`, `--radius-md`, `--radius-lg`, and `--radius-xl` with rem values

### Requirement: @mfe/ui provides animation tokens
The `packages/ui/tailwind.css` SHALL define animation tokens and keyframes in the `@theme` block for common UI transitions.

#### Scenario: Fade and slide animations are defined
- **WHEN** inspecting the `@theme` block in `packages/ui/tailwind.css`
- **THEN** it defines `--animate-fade-in`, `--animate-fade-out`, `--animate-slide-in`, `--animate-slide-out` with corresponding `@keyframes` blocks inside `@theme`

### Requirement: @mfe/ui provides base layer styles
The `packages/ui/tailwind.css` SHALL define base layer styles that apply semantic tokens to the root elements.

#### Scenario: Base styles use semantic tokens
- **WHEN** inspecting `packages/ui/tailwind.css`
- **THEN** it contains a `@layer base` block that applies `border-border` to all elements and `bg-background text-foreground antialiased` to the body
