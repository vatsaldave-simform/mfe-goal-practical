# ui-barrel-exports Specification

## Purpose
TBD - created by archiving change ui-components-extended. Update Purpose after archive.
## Requirements
### Requirement: @mfe/ui barrel exports all new components from src/index.ts
The `packages/ui/src/index.ts` SHALL re-export all new component exports so consumers can import everything from `@mfe/ui`.

#### Scenario: All form components are importable from @mfe/ui
- **WHEN** a consuming app writes `import { Field, FieldGroup, FieldLabel, FieldDescription, Select, SelectTrigger, SelectContent, SelectItem, SelectValue, SelectGroup, SelectLabel, SelectSeparator, Checkbox, Textarea } from "@mfe/ui"`
- **THEN** all imports resolve successfully

#### Scenario: All feedback components are importable from @mfe/ui
- **WHEN** a consuming app writes `import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose, Sheet, SheetTrigger, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription, SheetClose, Alert, AlertTitle, AlertDescription, Skeleton, Spinner } from "@mfe/ui"`
- **THEN** all imports resolve successfully

#### Scenario: Toast exports are importable from @mfe/ui
- **WHEN** a consuming app writes `import { Toaster, toast } from "@mfe/ui"`
- **THEN** both imports resolve successfully — `Toaster` is the sonner wrapper component and `toast` is the sonner toast function

#### Scenario: All navigation components are importable from @mfe/ui
- **WHEN** a consuming app writes `import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuSeparator, Avatar, AvatarImage, AvatarFallback, Tabs, TabsList, TabsTrigger, TabsContent } from "@mfe/ui"`
- **THEN** all imports resolve successfully

#### Scenario: All layout components are importable from @mfe/ui
- **WHEN** a consuming app writes `import { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption, ScrollArea, ScrollBar, Grid, Container } from "@mfe/ui"`
- **THEN** all imports resolve successfully

#### Scenario: Existing core component exports are unchanged
- **WHEN** a consuming app writes `import { Button, buttonVariants, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Input, Label, Badge, badgeVariants, Separator, cn } from "@mfe/ui"`
- **THEN** all existing imports continue to resolve successfully with no breaking changes

