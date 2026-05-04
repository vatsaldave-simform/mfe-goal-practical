## ADDED Requirements

### Requirement: @mfe/ui exports a Table compound component
The `@mfe/ui` package SHALL export `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, and `TableCaption` as compound component exports for data display.

#### Scenario: Table renders with full composition
- **WHEN** a consuming app renders `<Table><TableHeader><TableRow><TableHead>Name</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>Item</TableCell></TableRow></TableBody></Table>`
- **THEN** it renders a styled HTML table with proper semantic elements (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`)

#### Scenario: Table uses semantic tokens
- **WHEN** inspecting the Table component styles
- **THEN** it uses semantic tokens: borders with `border-border`, header text with `text-muted-foreground`, row hover with `hover:bg-muted/50`

#### Scenario: TableRow supports selected state
- **WHEN** a consuming app renders `<TableRow data-state="selected">`
- **THEN** the row displays with `bg-muted` background to indicate selection

#### Scenario: Table sub-components accept className override
- **WHEN** a consuming app passes `className` to any Table sub-component
- **THEN** the custom classes are merged with default classes via `cn()`

#### Scenario: Table renders responsively inside a container
- **WHEN** a Table has more columns than fit the viewport width
- **THEN** the Table's container allows horizontal scrolling via `overflow-auto`

### Requirement: @mfe/ui exports a ScrollArea component with Radix primitives
The `@mfe/ui` package SHALL export `ScrollArea` and `ScrollBar` components built on Radix UI ScrollArea primitives for custom scrollable regions.

#### Scenario: ScrollArea renders a scrollable container
- **WHEN** a consuming app renders `<ScrollArea className="h-[200px]"><div>...long content...</div></ScrollArea>`
- **THEN** it renders a scrollable container with custom scrollbar styling

#### Scenario: ScrollArea supports vertical and horizontal scrolling
- **WHEN** a consuming app renders `<ScrollArea><ScrollBar orientation="horizontal" /></ScrollArea>`
- **THEN** the scroll area displays a horizontal scrollbar when content overflows horizontally

#### Scenario: ScrollArea uses semantic tokens for scrollbar
- **WHEN** inspecting the ScrollBar component
- **THEN** the scrollbar thumb uses `bg-border` semantic token and the track is transparent

#### Scenario: ScrollArea accepts className override
- **WHEN** a consuming app passes `className` to ScrollArea
- **THEN** the custom classes are merged with default classes via `cn()`

### Requirement: @mfe/ui exports a Grid utility component
The `@mfe/ui` package SHALL export a `Grid` component that provides a responsive CSS grid layout wrapper.

#### Scenario: Grid renders a CSS grid with specified columns
- **WHEN** a consuming app renders `<Grid cols={3}>...</Grid>`
- **THEN** it renders a `div` with `display: grid` and `grid-template-columns: repeat(3, minmax(0, 1fr))`

#### Scenario: Grid supports responsive column overrides
- **WHEN** a consuming app renders `<Grid cols={1} colsSm={2} colsMd={3} colsLg={4}>...</Grid>`
- **THEN** the grid uses 1 column by default, 2 at `sm:`, 3 at `md:`, and 4 at `lg:` breakpoints

#### Scenario: Grid supports gap prop
- **WHEN** a consuming app renders `<Grid cols={2} gap={6}>...</Grid>`
- **THEN** the grid renders with `gap-6` utility class

#### Scenario: Grid accepts className override via cn()
- **WHEN** a consuming app passes `className` to Grid
- **THEN** the custom classes are merged with default classes using `cn()`

### Requirement: @mfe/ui exports a Container utility component
The `@mfe/ui` package SHALL export a `Container` component that provides a centered, max-width page wrapper with horizontal padding.

#### Scenario: Container renders a centered wrapper
- **WHEN** a consuming app renders `<Container>Page content</Container>`
- **THEN** it renders a `div` with `mx-auto`, `w-full`, a max-width constraint, and horizontal padding

#### Scenario: Container supports size variants
- **WHEN** a consuming app renders `<Container size="sm">`, `<Container size="md">`, `<Container size="lg">`, or `<Container size="xl">`
- **THEN** the container applies the corresponding max-width: `sm` → `max-w-screen-sm`, `md` → `max-w-screen-md`, `lg` → `max-w-screen-lg`, `xl` → `max-w-screen-xl`

#### Scenario: Container defaults to xl size
- **WHEN** a consuming app renders `<Container>` without a size prop
- **THEN** it uses `max-w-screen-xl` as the default max-width

#### Scenario: Container accepts className override via cn()
- **WHEN** a consuming app passes `className` to Container
- **THEN** the custom classes are merged with default classes using `cn()`
