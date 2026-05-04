# ui-feedback-components Specification

## Purpose
TBD - created by archiving change ui-components-extended. Update Purpose after archive.
## Requirements
### Requirement: @mfe/ui exports a Dialog compound component with Radix primitives
The `@mfe/ui` package SHALL export `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, and `DialogClose` as compound component exports built on Radix UI Dialog primitives.

#### Scenario: Dialog renders with overlay and centered content
- **WHEN** a consuming app renders a Dialog with DialogTrigger and DialogContent
- **THEN** clicking the trigger opens a modal overlay with centered content panel

#### Scenario: Dialog always has a DialogTitle
- **WHEN** a consuming app creates a Dialog
- **THEN** it includes a `DialogTitle` for accessibility (may use `className="sr-only"` if visually hidden)

#### Scenario: Dialog uses semantic tokens and animations
- **WHEN** inspecting the Dialog component styles
- **THEN** it uses `bg-background`, `border-border`, `text-foreground` semantic tokens and fade/slide animations for entry/exit

#### Scenario: Dialog closes on overlay click and Escape key
- **WHEN** a user clicks the overlay backdrop or presses Escape
- **THEN** the Dialog closes

#### Scenario: DialogContent traps focus
- **WHEN** a Dialog is open
- **THEN** keyboard focus is trapped within the dialog content per WAI-ARIA dialog pattern

### Requirement: @mfe/ui exports a Sheet compound component with Radix primitives
The `@mfe/ui` package SHALL export `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`, and `SheetClose` as compound component exports built on Radix UI Dialog primitives (Sheet is a side-panel variant).

#### Scenario: Sheet renders as a side panel
- **WHEN** a consuming app renders a Sheet with SheetContent
- **THEN** it renders a panel that slides in from the side (default: right) with an overlay backdrop

#### Scenario: Sheet supports side prop
- **WHEN** a consuming app renders `<SheetContent side="left">`
- **THEN** the sheet slides in from the left side instead of the default right

#### Scenario: Sheet always has a SheetTitle
- **WHEN** a consuming app creates a Sheet
- **THEN** it includes a `SheetTitle` for accessibility (per shadcn rule: "Dialog, Sheet, and Drawer always need a Title")

#### Scenario: Sheet uses semantic tokens
- **WHEN** inspecting the Sheet component styles
- **THEN** it uses `bg-background`, `border-border` semantic tokens (never raw color values)

### Requirement: @mfe/ui exports an Alert component with CVA variants
The `@mfe/ui` package SHALL export `Alert`, `AlertTitle`, and `AlertDescription` components for inline feedback messaging. The Alert SHALL use CVA variants for `default` and `destructive` states.

#### Scenario: Alert renders with default variant
- **WHEN** a consuming app renders `<Alert><AlertTitle>Info</AlertTitle><AlertDescription>Details here</AlertDescription></Alert>`
- **THEN** it renders a styled alert box with `bg-background` and `border-border` styling

#### Scenario: Alert renders with destructive variant
- **WHEN** a consuming app renders `<Alert variant="destructive">`
- **THEN** it renders with `text-destructive` and `border-destructive` styling

#### Scenario: Alert supports icon placement
- **WHEN** a consuming app places a Lucide icon as the first child of Alert
- **THEN** the icon renders inline with the alert content using proper spacing

#### Scenario: Alert uses semantic tokens
- **WHEN** inspecting the Alert component
- **THEN** all colors use semantic tokens (`bg-background`, `text-foreground`, `border-border`, `text-destructive`)

### Requirement: @mfe/ui exports a Skeleton component
The `@mfe/ui` package SHALL export a `Skeleton` component for loading placeholder states.

#### Scenario: Skeleton renders an animated placeholder
- **WHEN** a consuming app renders `<Skeleton className="h-4 w-[250px]" />`
- **THEN** it renders a `div` with `bg-muted` background and a pulse animation

#### Scenario: Skeleton uses semantic tokens
- **WHEN** inspecting the Skeleton component
- **THEN** it uses `bg-muted` semantic token (never raw color values like `bg-gray-200`)

#### Scenario: Skeleton accepts className for sizing
- **WHEN** a consuming app passes `className="h-12 w-12 rounded-full"` to Skeleton
- **THEN** the custom sizing and shape classes are merged with default classes via `cn()`

### Requirement: @mfe/ui exports a Spinner component
The `@mfe/ui` package SHALL export a `Spinner` component for inline loading indicators.

#### Scenario: Spinner renders an animated loading indicator
- **WHEN** a consuming app renders `<Spinner />`
- **THEN** it renders an SVG or icon element with a spin animation

#### Scenario: Spinner can indicate loading state in a Button
- **WHEN** a consuming app renders `<Button disabled><Spinner data-icon="inline-start" />Loading...</Button>`
- **THEN** the Spinner renders inline with the button text using `data-icon` attribute per shadcn icon rules

#### Scenario: Spinner uses semantic color tokens
- **WHEN** inspecting the Spinner component
- **THEN** it uses semantic color tokens (e.g., `text-muted-foreground` or `currentColor`) for consistent theming

