# ui-navigation-components Specification

## Purpose
TBD - created by archiving change ui-components-extended. Update Purpose after archive.
## Requirements
### Requirement: @mfe/ui exports a DropdownMenu compound component with Radix primitives
The `@mfe/ui` package SHALL export `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuGroup`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem`, and `DropdownMenuSub`/`DropdownMenuSubTrigger`/`DropdownMenuSubContent` as compound component exports built on Radix UI DropdownMenu primitives.

#### Scenario: DropdownMenu renders with trigger and content
- **WHEN** a consuming app renders a DropdownMenu with DropdownMenuTrigger and DropdownMenuContent containing DropdownMenuItems
- **THEN** clicking the trigger opens a positioned dropdown with selectable menu items

#### Scenario: DropdownMenuItem is always inside DropdownMenuGroup
- **WHEN** a consuming app composes dropdown menu items
- **THEN** DropdownMenuItems are placed inside DropdownMenuGroup per shadcn composition rule ("Items always inside their Group")

#### Scenario: DropdownMenu supports keyboard navigation
- **WHEN** a user presses ArrowDown/ArrowUp while the menu is open
- **THEN** focus moves between DropdownMenuItems, and Enter/Space activates the focused item

#### Scenario: DropdownMenu uses semantic tokens
- **WHEN** inspecting the DropdownMenu component styles
- **THEN** it uses `bg-popover`, `text-popover-foreground`, `border-border` semantic tokens

#### Scenario: DropdownMenu closes on item selection and Escape
- **WHEN** a user selects a DropdownMenuItem or presses Escape
- **THEN** the dropdown menu closes

### Requirement: @mfe/ui exports Avatar and AvatarFallback components with Radix primitives
The `@mfe/ui` package SHALL export `Avatar`, `AvatarImage`, and `AvatarFallback` as compound component exports built on Radix UI Avatar primitives. Every `Avatar` usage MUST include an `AvatarFallback`.

#### Scenario: Avatar renders an image with fallback
- **WHEN** a consuming app renders `<Avatar><AvatarImage src="/user.jpg" alt="John" /><AvatarFallback>JD</AvatarFallback></Avatar>`
- **THEN** it renders the image, and if the image fails to load, displays the "JD" fallback text

#### Scenario: AvatarFallback is always required
- **WHEN** a consuming app uses the Avatar component
- **THEN** it always includes `AvatarFallback` per shadcn rule ("Avatar always needs AvatarFallback")

#### Scenario: Avatar uses size-* for equal dimensions
- **WHEN** a consuming app renders `<Avatar className="size-10">`
- **THEN** the Avatar uses `size-*` utility (not separate `w-*` and `h-*`) per shadcn styling rule

#### Scenario: Avatar uses semantic tokens
- **WHEN** inspecting the Avatar component styles
- **THEN** AvatarFallback uses `bg-muted` and `text-muted-foreground` semantic tokens

### Requirement: @mfe/ui exports a Tabs compound component with Radix primitives
The `@mfe/ui` package SHALL export `Tabs`, `TabsList`, `TabsTrigger`, and `TabsContent` as compound component exports built on Radix UI Tabs primitives.

#### Scenario: Tabs renders with a tab list and content panels
- **WHEN** a consuming app renders Tabs with TabsList, TabsTrigger elements, and TabsContent panels
- **THEN** clicking a tab trigger activates the corresponding content panel

#### Scenario: TabsTrigger is always inside TabsList
- **WHEN** a consuming app composes tabs
- **THEN** TabsTrigger elements are placed inside TabsList per shadcn rule ("TabsTrigger must be inside TabsList")

#### Scenario: Tabs supports keyboard navigation
- **WHEN** a user presses ArrowLeft/ArrowRight within the TabsList
- **THEN** focus moves between TabsTrigger elements, and the focused tab can be activated

#### Scenario: Tabs uses semantic tokens for active state
- **WHEN** a TabsTrigger is active
- **THEN** it displays with `bg-background` and `text-foreground` styling distinguishing it from inactive triggers using `text-muted-foreground`

#### Scenario: TabsContent animates entry
- **WHEN** a TabsContent becomes visible
- **THEN** it uses a subtle fade-in transition for smooth panel switching

#### Scenario: Tabs accepts className overrides via cn()
- **WHEN** a consuming app passes `className` to Tabs, TabsList, TabsTrigger, or TabsContent
- **THEN** the custom classes are merged with default classes using `cn()`

