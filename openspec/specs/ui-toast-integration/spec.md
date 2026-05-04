# ui-toast-integration Specification

## Purpose
TBD - created by archiving change ui-components-extended. Update Purpose after archive.
## Requirements
### Requirement: @mfe/ui exports a Toaster component wrapping sonner
The `@mfe/ui` package SHALL export a `Toaster` component that wraps `sonner`'s `<Toaster />` with the project's semantic design tokens applied.

#### Scenario: Toaster renders at the app root
- **WHEN** a consuming app renders `<Toaster />` in its root layout component
- **THEN** sonner's toast container is mounted in the DOM, ready to display toast notifications

#### Scenario: Toaster uses semantic color tokens
- **WHEN** inspecting the Toaster component's theme configuration
- **THEN** toast styles map to project semantic tokens: background uses `--color-background`, foreground uses `--color-foreground`, border uses `--color-border`, and destructive variant uses `--color-destructive`

#### Scenario: Toaster supports position configuration
- **WHEN** a consuming app renders `<Toaster position="top-right" />`
- **THEN** toast notifications appear anchored to the specified position

### Requirement: @mfe/ui re-exports toast function from sonner
The `@mfe/ui` package SHALL re-export the `toast` function from the `sonner` package so consumers can trigger toasts via `import { toast } from "@mfe/ui"`.

#### Scenario: Triggering a success toast
- **WHEN** a consuming component calls `toast.success("Item added to cart")`
- **THEN** a success-styled toast notification appears in the Toaster container

#### Scenario: Triggering an error toast
- **WHEN** a consuming component calls `toast.error("Failed to place order")`
- **THEN** a destructive-styled toast notification appears

#### Scenario: Triggering a toast with description
- **WHEN** a consuming component calls `toast("Order placed", { description: "Order #12345 confirmed" })`
- **THEN** a toast appears with both title and description text

#### Scenario: toast is importable from @mfe/ui
- **WHEN** a consuming app writes `import { toast } from "@mfe/ui"`
- **THEN** the import resolves successfully to sonner's toast function

### Requirement: sonner is a dependency of @mfe/ui
The `packages/ui/package.json` SHALL list `sonner` in `dependencies`.

#### Scenario: sonner is declared in package.json
- **WHEN** inspecting `packages/ui/package.json` dependencies
- **THEN** `"sonner"` is listed as a dependency

