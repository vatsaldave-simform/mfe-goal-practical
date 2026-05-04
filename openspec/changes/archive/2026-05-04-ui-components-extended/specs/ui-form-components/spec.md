## ADDED Requirements

### Requirement: @mfe/ui exports Field and FieldGroup form layout components
The `@mfe/ui` package SHALL export `Field`, `FieldGroup`, `FieldLabel`, and `FieldDescription` components for structured form layout. All forms in the project SHALL use `FieldGroup` + `Field` for layout instead of raw `div` with `space-y-*` or `grid gap-*`.

#### Scenario: FieldGroup renders a vertical stack of fields
- **WHEN** a consuming app renders `<FieldGroup><Field>...</Field><Field>...</Field></FieldGroup>`
- **THEN** it renders a container with consistent vertical spacing between fields using `flex flex-col gap-*`

#### Scenario: Field wraps a label and control with proper spacing
- **WHEN** a consuming app renders `<Field><FieldLabel htmlFor="email">Email</FieldLabel><Input id="email" /></Field>`
- **THEN** it renders a container with the label above the input with consistent spacing

#### Scenario: Field supports validation state via data-invalid
- **WHEN** a consuming app renders `<Field data-invalid><FieldLabel>Email</FieldLabel><Input aria-invalid /><FieldDescription>Invalid email.</FieldDescription></Field>`
- **THEN** the Field applies invalid styling, the control has `aria-invalid`, and the FieldDescription displays the error message with destructive color

#### Scenario: Field supports disabled state via data-disabled
- **WHEN** a consuming app renders `<Field data-disabled><FieldLabel>Email</FieldLabel><Input disabled /></Field>`
- **THEN** the Field and its children display with reduced opacity and `cursor-not-allowed`

#### Scenario: FieldLabel renders with consistent typography
- **WHEN** a consuming app renders `<FieldLabel htmlFor="name">Name</FieldLabel>`
- **THEN** it renders a `<label>` element with `text-sm font-medium leading-none` classes matching the existing Label component

#### Scenario: FieldDescription renders helper or error text
- **WHEN** a consuming app renders `<FieldDescription>Must be at least 8 characters</FieldDescription>`
- **THEN** it renders a `<p>` element with `text-sm text-muted-foreground` styling

### Requirement: @mfe/ui exports a Select component with Radix primitives
The `@mfe/ui` package SHALL export `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue`, `SelectGroup`, `SelectLabel`, and `SelectSeparator` as compound component exports built on Radix UI Select primitives.

#### Scenario: Select renders with trigger and dropdown content
- **WHEN** a consuming app renders a Select with SelectTrigger, SelectContent, and SelectItems
- **THEN** it renders a styled select trigger that opens a dropdown with selectable items on click

#### Scenario: SelectItem is always inside SelectGroup
- **WHEN** a consuming app composes Select items
- **THEN** SelectItems are placed inside SelectGroup per shadcn composition rule ("Items always inside their Group")

#### Scenario: Select uses semantic color tokens
- **WHEN** inspecting the Select component styles
- **THEN** it uses `bg-background`, `border-border`, `text-foreground`, and `ring-ring` semantic tokens (never raw color values)

#### Scenario: Select supports keyboard navigation
- **WHEN** a user presses ArrowDown/ArrowUp while the select is open
- **THEN** focus moves between SelectItems, and Enter/Space selects the focused item

#### Scenario: Select accepts className override via cn()
- **WHEN** a consuming app passes `className` to SelectTrigger or SelectContent
- **THEN** the custom classes are merged with default classes using `cn()`

### Requirement: @mfe/ui exports a Checkbox component with Radix primitives
The `@mfe/ui` package SHALL export a `Checkbox` component built on Radix UI Checkbox primitives with a check indicator.

#### Scenario: Checkbox renders with default styling
- **WHEN** a consuming app renders `<Checkbox id="terms" />`
- **THEN** it renders a styled checkbox with `border-primary` border and `size-4` dimensions

#### Scenario: Checkbox shows check indicator when checked
- **WHEN** a user clicks the Checkbox
- **THEN** it toggles to checked state and displays a check icon using `lucide-react` Check icon

#### Scenario: Checkbox supports controlled and uncontrolled modes
- **WHEN** a consuming app passes `checked` and `onCheckedChange` props
- **THEN** the Checkbox operates in controlled mode, reporting state changes

#### Scenario: Checkbox uses semantic tokens and focus ring
- **WHEN** a user focuses the Checkbox via keyboard
- **THEN** it displays a focus ring using `ring-ring` semantic token

### Requirement: @mfe/ui exports a Textarea component
The `@mfe/ui` package SHALL export a `Textarea` component that renders a styled `<textarea>` element consistent with the existing Input component styling.

#### Scenario: Textarea renders with default styles
- **WHEN** a consuming app renders `<Textarea placeholder="Enter description" />`
- **THEN** it renders a styled textarea with border, background, and semantic color tokens matching the Input component design

#### Scenario: Textarea shows focus ring on focus
- **WHEN** a user focuses the Textarea
- **THEN** it displays a focus ring using `ring-ring` semantic token

#### Scenario: Textarea supports disabled state
- **WHEN** a consuming app renders `<Textarea disabled />`
- **THEN** the textarea shows `cursor-not-allowed` and reduced opacity

#### Scenario: Textarea accepts className override via cn()
- **WHEN** a consuming app passes `className="min-h-[120px]"` to Textarea
- **THEN** the custom class is merged with default classes using `cn()`

#### Scenario: Textarea accepts ref as a regular prop
- **WHEN** a consuming app passes a `ref` prop to `<Textarea ref={myRef}>`
- **THEN** the ref is forwarded to the underlying `<textarea>` element (React 19 pattern, no forwardRef)
