## 1. Dependencies & Setup

- [x] 1.1 Add `sonner` to `packages/ui/package.json` dependencies and run `pnpm install` from the workspace root
  - **Target**: `packages/ui`
  - **Skills to load**: shadcn
  - **Verify**: `pnpm ls sonner --filter @mfe/ui` shows sonner installed

## 2. Form Components

- [x] 2.1 Add Field, FieldGroup, FieldLabel, FieldDescription components via shadcn CLI (`pnpm dlx shadcn@latest add field` from `packages/ui`) — review generated file for correct imports, `cn()` usage, `data-invalid`/`data-disabled` support, and React 19 patterns (no forwardRef)
  - **Target**: `packages/ui/src/components/field.tsx`
  - **Skills to load**: shadcn, vercel-composition-patterns, vercel-react-best-practices
  - **Verify**: File exists, exports Field, FieldGroup, FieldLabel, FieldDescription

- [x] 2.2 Add Select compound component via shadcn CLI (`pnpm dlx shadcn@latest add select` from `packages/ui`) — review for SelectGroup wrapping SelectItems, semantic tokens, `cn()` merging
  - **Target**: `packages/ui/src/components/select.tsx`
  - **Skills to load**: shadcn, vercel-composition-patterns
  - **Verify**: File exports Select, SelectTrigger, SelectContent, SelectItem, SelectValue, SelectGroup, SelectLabel, SelectSeparator

- [x] 2.3 Add Checkbox component via shadcn CLI (`pnpm dlx shadcn@latest add checkbox` from `packages/ui`) — review for check indicator icon, semantic tokens, focus ring
  - **Target**: `packages/ui/src/components/checkbox.tsx`
  - **Skills to load**: shadcn
  - **Verify**: File exports Checkbox with proper Radix primitives

- [x] 2.4 Add Textarea component via shadcn CLI (`pnpm dlx shadcn@latest add textarea` from `packages/ui`) — review for consistency with Input styling, React 19 ref pattern
  - **Target**: `packages/ui/src/components/textarea.tsx`
  - **Skills to load**: shadcn, vercel-react-best-practices
  - **Verify**: File exports Textarea, styling matches Input component

## 3. Feedback Components

- [x] 3.1 Add Dialog compound component via shadcn CLI (`pnpm dlx shadcn@latest add dialog` from `packages/ui`) — review for DialogTitle requirement, focus trapping, overlay backdrop, semantic tokens
  - **Target**: `packages/ui/src/components/dialog.tsx`
  - **Skills to load**: shadcn, vercel-composition-patterns
  - **Verify**: File exports Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose

- [x] 3.2 Add Sheet compound component via shadcn CLI (`pnpm dlx shadcn@latest add sheet` from `packages/ui`) — review for SheetTitle requirement, `side` prop support, semantic tokens
  - **Target**: `packages/ui/src/components/sheet.tsx`
  - **Skills to load**: shadcn, vercel-composition-patterns
  - **Verify**: File exports Sheet, SheetTrigger, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription, SheetClose

- [x] 3.3 Add Alert component via shadcn CLI (`pnpm dlx shadcn@latest add alert` from `packages/ui`) — review for CVA variants (default, destructive), semantic tokens
  - **Target**: `packages/ui/src/components/alert.tsx`
  - **Skills to load**: shadcn
  - **Verify**: File exports Alert, AlertTitle, AlertDescription with variant support

- [x] 3.4 Add Skeleton component via shadcn CLI (`pnpm dlx shadcn@latest add skeleton` from `packages/ui`) — review for `bg-muted` token, pulse animation
  - **Target**: `packages/ui/src/components/skeleton.tsx`
  - **Skills to load**: shadcn
  - **Verify**: File exports Skeleton with correct animation

- [x] 3.5 Add Spinner component — hand-write a simple SVG spinner with `animate-spin` and `currentColor`/`text-muted-foreground`, supporting `data-icon` usage in buttons
  - **Target**: `packages/ui/src/components/spinner.tsx`
  - **Skills to load**: shadcn (icons rules), vercel-react-best-practices
  - **Verify**: File exports Spinner, renders animated SVG, works with `data-icon`

## 4. Toast Integration

- [x] 4.1 Add sonner Toaster wrapper via shadcn CLI (`pnpm dlx shadcn@latest add sonner` from `packages/ui`) — review for semantic token mapping (background, foreground, border, destructive), re-export of `toast` function
  - **Target**: `packages/ui/src/components/sonner.tsx`
  - **Skills to load**: shadcn
  - **Verify**: File exports Toaster component with theme tokens applied, `toast` re-exported

## 5. Navigation Components

- [x] 5.1 Add DropdownMenu compound component via shadcn CLI (`pnpm dlx shadcn@latest add dropdown-menu` from `packages/ui`) — review for DropdownMenuGroup wrapping items, keyboard navigation, semantic tokens
  - **Target**: `packages/ui/src/components/dropdown-menu.tsx`
  - **Skills to load**: shadcn, vercel-composition-patterns
  - **Verify**: File exports DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuSeparator, plus checkbox/radio/sub variants

- [x] 5.2 Add Avatar compound component via shadcn CLI (`pnpm dlx shadcn@latest add avatar` from `packages/ui`) — review for AvatarFallback always required, `size-*` usage, semantic tokens
  - **Target**: `packages/ui/src/components/avatar.tsx`
  - **Skills to load**: shadcn
  - **Verify**: File exports Avatar, AvatarImage, AvatarFallback

- [x] 5.3 Add Tabs compound component via shadcn CLI (`pnpm dlx shadcn@latest add tabs` from `packages/ui`) — review for TabsTrigger inside TabsList, keyboard nav, active state tokens
  - **Target**: `packages/ui/src/components/tabs.tsx`
  - **Skills to load**: shadcn, vercel-composition-patterns
  - **Verify**: File exports Tabs, TabsList, TabsTrigger, TabsContent

## 6. Layout Components

- [x] 6.1 Add Table compound component via shadcn CLI (`pnpm dlx shadcn@latest add table` from `packages/ui`) — review for semantic elements, `data-state="selected"` support, overflow-auto wrapper
  - **Target**: `packages/ui/src/components/table.tsx`
  - **Skills to load**: shadcn, vercel-composition-patterns
  - **Verify**: File exports Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption

- [x] 6.2 Add ScrollArea component via shadcn CLI (`pnpm dlx shadcn@latest add scroll-area` from `packages/ui`) — review for scrollbar thumb token (`bg-border`), orientation support
  - **Target**: `packages/ui/src/components/scroll-area.tsx`
  - **Skills to load**: shadcn
  - **Verify**: File exports ScrollArea, ScrollBar

- [x] 6.3 Create Grid utility component — hand-write with `cols`, `colsSm`, `colsMd`, `colsLg`, and `gap` props mapping to Tailwind grid utilities, using `cn()` for class merging
  - **Target**: `packages/ui/src/components/grid.tsx`
  - **Skills to load**: tailwind-design-system, vercel-react-best-practices
  - **Verify**: File exports Grid, renders responsive CSS grid

- [x] 6.4 Create Container utility component — hand-write with `size` prop (sm/md/lg/xl, default xl) mapping to `max-w-screen-*`, using `cn()` for class merging
  - **Target**: `packages/ui/src/components/container.tsx`
  - **Skills to load**: tailwind-design-system, vercel-react-best-practices
  - **Verify**: File exports Container, renders centered max-width wrapper

## 7. Barrel Exports

- [x] 7.1 Update `packages/ui/src/index.ts` to re-export all new components: Field/FieldGroup/FieldLabel/FieldDescription, Select/*, Checkbox, Textarea, Dialog/*, Sheet/*, Alert/*, Skeleton, Spinner, Toaster, toast, DropdownMenu/*, Avatar/*, Tabs/*, Table/*, ScrollArea/ScrollBar, Grid, Container — ensure existing exports (Button, Card, Input, Label, Badge, Separator, cn) remain unchanged
  - **Target**: `packages/ui/src/index.ts`
  - **Skills to load**: shadcn, typescript-advanced-types
  - **Verify**: All imports listed in ui-barrel-exports spec resolve; existing imports unbroken

## 8. Build Verification

- [x] 8.1 Run `turbo run build --filter=@mfe/ui` and fix any TypeScript compilation errors in the new component files
  - **Target**: `packages/ui`
  - **Skills to load**: turborepo
  - **Verify**: Build completes with zero errors
