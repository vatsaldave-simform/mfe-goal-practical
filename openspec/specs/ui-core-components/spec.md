## ADDED Requirements

### Requirement: @mfe/ui exports a Button component with CVA variants
The `@mfe/ui` package SHALL export a `Button` component built with `class-variance-authority` (CVA) that supports `variant`, `size`, and `asChild` props. The component SHALL use `@radix-ui/react-slot` for the `asChild` pattern and `cn()` for class merging.

#### Scenario: Button renders with default variant and size
- **WHEN** a consuming app renders `<Button>Click me</Button>`
- **THEN** it renders a `<button>` element with primary background, primary-foreground text, default height (h-10), and default padding

#### Scenario: Button renders with destructive variant
- **WHEN** a consuming app renders `<Button variant="destructive">Delete</Button>`
- **THEN** it renders with destructive background and destructive-foreground text colors

#### Scenario: Button supports all standard variants
- **WHEN** inspecting the Button component
- **THEN** it supports variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`

#### Scenario: Button supports all standard sizes
- **WHEN** inspecting the Button component
- **THEN** it supports sizes: `default` (h-10), `sm` (h-9), `lg` (h-11), `icon` (size-10)

#### Scenario: Button supports asChild for custom elements
- **WHEN** a consuming app renders `<Button asChild><a href="/home">Home</a></Button>`
- **THEN** it renders an `<a>` element with button styling applied via `Slot` from `@radix-ui/react-slot`

#### Scenario: Button accepts ref as a regular prop
- **WHEN** a consuming app passes a `ref` prop to `<Button ref={myRef}>`
- **THEN** the ref is forwarded to the underlying element without `React.forwardRef` (React 19 pattern)

### Requirement: @mfe/ui exports a Card compound component
The `@mfe/ui` package SHALL export `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `CardFooter` as individual named exports that compose together.

#### Scenario: Card renders with full composition
- **WHEN** a consuming app renders `<Card><CardHeader><CardTitle>Title</CardTitle><CardDescription>Desc</CardDescription></CardHeader><CardContent>Body</CardContent><CardFooter>Footer</CardFooter></Card>`
- **THEN** it renders a styled card with rounded border, card background, shadow, and properly spaced header/content/footer sections

#### Scenario: Card uses semantic tokens
- **WHEN** inspecting the Card component classes
- **THEN** it uses `bg-card`, `text-card-foreground`, and `border-border` semantic tokens (never raw color values)

#### Scenario: Each Card sub-component accepts className override
- **WHEN** a consuming app passes `className="my-custom"` to any Card sub-component
- **THEN** the custom class is merged with default classes via `cn()`

### Requirement: @mfe/ui exports an Input component
The `@mfe/ui` package SHALL export an `Input` component that renders a styled `<input>` element with consistent styling and focus states.

#### Scenario: Input renders with default styles
- **WHEN** a consuming app renders `<Input type="text" placeholder="Enter name" />`
- **THEN** it renders a styled input with border, background, appropriate height (h-10), and semantic color tokens

#### Scenario: Input shows focus ring on focus
- **WHEN** a user focuses the Input element
- **THEN** it displays a focus ring using `ring-ring` semantic token

#### Scenario: Input supports disabled state
- **WHEN** a consuming app renders `<Input disabled />`
- **THEN** the input shows `cursor-not-allowed` and reduced opacity

### Requirement: @mfe/ui exports a Label component
The `@mfe/ui` package SHALL export a `Label` component that renders a styled `<label>` element.

#### Scenario: Label renders with default styles
- **WHEN** a consuming app renders `<Label htmlFor="email">Email</Label>`
- **THEN** it renders a `<label>` element with `text-sm`, `font-medium`, and `leading-none` classes

#### Scenario: Label reflects peer disabled state
- **WHEN** the associated input is disabled
- **THEN** the Label shows `cursor-not-allowed` and reduced opacity via peer-disabled utility

### Requirement: @mfe/ui exports a Badge component
The `@mfe/ui` package SHALL export a `Badge` component with CVA variants for status indication.

#### Scenario: Badge renders with default variant
- **WHEN** a consuming app renders `<Badge>New</Badge>`
- **THEN** it renders an inline element with primary background and primary-foreground text

#### Scenario: Badge supports variant options
- **WHEN** inspecting the Badge component
- **THEN** it supports variants: `default`, `secondary`, `destructive`, `outline`

### Requirement: @mfe/ui exports a Separator component
The `@mfe/ui` package SHALL export a `Separator` component for visual division between content sections.

#### Scenario: Separator renders horizontal by default
- **WHEN** a consuming app renders `<Separator />`
- **THEN** it renders a horizontal line using `border-border` with `h-px w-full`

#### Scenario: Separator supports vertical orientation
- **WHEN** a consuming app renders `<Separator orientation="vertical" />`
- **THEN** it renders a vertical line with `w-px h-full`

### Requirement: @mfe/ui barrel exports all components from src/index.ts
The `packages/ui/src/index.ts` SHALL re-export all component exports and the `cn` utility so consumers can import everything from `@mfe/ui`.

#### Scenario: All core components are importable from @mfe/ui
- **WHEN** a consuming app writes `import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Input, Label, Badge, Separator, cn } from "@mfe/ui"`
- **THEN** all imports resolve successfully

#### Scenario: Button variant types are importable
- **WHEN** a consuming app writes `import { type ButtonProps } from "@mfe/ui"`
- **THEN** the `ButtonProps` type is available and includes `variant`, `size`, and `asChild` fields
