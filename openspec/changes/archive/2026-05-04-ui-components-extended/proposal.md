## Why

The `@mfe/ui` package currently ships only foundational components (Button, Card, Input, Label, Badge, Separator). Building real e-commerce pages — product listings with tables, cart dialogs, order forms, account settings, toast notifications — requires a much richer component set. Without these shared components, each MFE will either reimplement them inconsistently or use raw HTML with ad-hoc styling, violating ADR-007 (shared design system in `packages/ui`).

## What Changes

- **Form components**: Add `Select`, `Checkbox`, `Textarea`, `Field`, and `FieldGroup` so MFEs can build validated forms using shadcn composition patterns (ADR-008: React Hook Form + Zod with shadcn Field/FieldGroup layout).
- **Feedback components**: Add `Dialog`, `Sheet`, `Alert`, `Skeleton`, and `Spinner` for overlays, inline alerts, and loading states.
- **Toast**: Integrate `sonner` for toast notifications (`toast()` API), following shadcn convention of using sonner rather than a custom toast system.
- **Navigation components**: Add `DropdownMenu`, `Avatar` (with `AvatarFallback`), and `Tabs` for menus, user profile display, and tabbed content.
- **Layout components**: Add `Table` (compound component: Table, TableHeader, TableBody, TableRow, TableHead, TableCell) and `ScrollArea` for data display and overflow management.
- **Utility components**: Add `Grid` and `Container` layout primitives for consistent page-level layout across all MFEs.
- **Barrel exports**: Update `packages/ui/src/index.ts` to re-export every new component.

## Non-goals

- Domain-specific components (ProductCard, CartItem, OrderRow) — those belong in MFE `components/` directories, not the shared library.
- Dark-mode token changes — the existing token set in `tailwind.css` already covers dark mode.
- Component theming API or runtime theme switching.
- Form logic (React Hook Form wiring, Zod resolvers) — that is local to each MFE per ADR-008.
- Chart or data-visualization components.

## Capabilities

### New Capabilities

- `ui-form-components`: Field, FieldGroup, Select, Checkbox, and Textarea components for form composition
- `ui-feedback-components`: Dialog, Sheet, Alert, Skeleton, and Spinner components for overlays, inline feedback, and loading states
- `ui-toast-integration`: sonner-based toast notification system with `Toaster` provider and `toast()` API
- `ui-navigation-components`: DropdownMenu, Avatar (with AvatarFallback), and Tabs for navigational UI
- `ui-layout-components`: Table compound component, ScrollArea, plus Grid and Container utility components
- `ui-barrel-exports`: Updated barrel exports in `src/index.ts` covering all new components

### Modified Capabilities

_(none — existing component specs and design token requirements are unchanged)_

## Impact

- **packages/ui**: New component files in `src/components/`, updated `src/index.ts` barrel, new `radix-ui` sub-package imports (dialog, select, checkbox, tabs, dropdown-menu, avatar, scroll-area), and `sonner` dependency added to `package.json`.
- **All frontend apps (host, storefront, account)**: Gain access to the new components via `@mfe/ui`. The apps' `app.css` `@source` directive already scans `packages/ui/src/**` so new Tailwind classes will be picked up automatically.
- **No breaking changes**: All existing components and APIs remain unchanged. This is purely additive.

## Skills

- **shadcn** — component installation, composition rules (FieldGroup+Field forms, Dialog/Sheet requiring Title, Avatar+AvatarFallback, sonner toast pattern)
- **tailwind-design-system** — semantic token usage, OKLCH colors, animation tokens for overlays
- **vercel-composition-patterns** — compound component APIs (Table, DropdownMenu, Tabs), avoiding boolean prop proliferation
- **vercel-react-best-practices** — React 19 patterns (no forwardRef), performance considerations
- **typescript-advanced-types** — component prop types, variant type exports
