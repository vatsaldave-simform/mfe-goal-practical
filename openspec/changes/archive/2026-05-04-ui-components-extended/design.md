## Context

`@mfe/ui` currently ships six foundational components (Button, Card, Input, Label, Badge, Separator) installed via shadcn CLI into `packages/ui/src/components/`. The package uses Radix UI primitives, CVA for variants, Tailwind CSS v4 with OKLCH design tokens, and the `cn()` utility for class merging. It has `components.json` configured for the `new-york` style with `radix` base and `lucide` icons.

The three MFE apps (host, storefront, account) already depend on `@mfe/ui` via `workspace:*` and their `app.css` files include a `@source` directive scanning `packages/ui/src/**`. This means adding new component files to the UI package makes them immediately available to every MFE with zero config changes.

The e-commerce domain requires forms (login, register, checkout, cart quantity), overlays (cart preview dialog, mobile nav sheet), feedback (order success toast, loading skeletons), navigation (user menu dropdown, tabs for account sections), and data display (order history table, product listing scroll areas).

## Goals / Non-Goals

**Goals:**

- Provide a complete set of shared UI primitives so MFEs can build all planned pages without custom markup
- Follow shadcn composition rules exactly (per shadcn skill): FieldGroup+Field for forms, Title required on Dialog/Sheet, AvatarFallback always present, sonner for toasts
- Use Radix UI primitives consistently for accessible, keyboard-navigable components
- Add `sonner` as the sole toast solution
- Create `Grid` and `Container` utility components for consistent page-level layout
- Keep all components tree-shakeable via named exports from individual files

**Non-Goals:**

- Domain-specific composed components (ProductCard, CartItem, OrderRow) — those live in MFE `components/` directories per ADR-007
- Form-level wiring (React Hook Form, Zod resolver integration) — per ADR-008, form composition is local to each MFE
- Animation tokens — the existing `@theme` block already defines fade/slide animations; no new tokens needed
- Runtime theme switching or dark mode toggle component — token infrastructure already exists in `tailwind.css`
- Charts, data visualization, or complex data grid components

## Decisions

### Decision 1: Install via shadcn CLI into packages/ui

**Choice**: Use `pnpm dlx shadcn@latest add <component>` from the `packages/ui` directory for all Radix-based components.

**Rationale**: The `components.json` is already configured with correct aliases (`@mfe/ui/components`, `@mfe/ui/lib/utils`). The CLI generates components with proper import paths, `cn()` usage, and `radix-ui` primitives matching our `new-york` style. This avoids hand-writing Radix wrappers and ensures consistency with the existing Button/Card/Input components.

**Alternative considered**: Hand-writing components without the CLI. Rejected because it would diverge from shadcn conventions and miss Radix accessibility primitives.

### Decision 2: Custom Grid and Container components (not shadcn)

**Choice**: Hand-write `Grid` and `Container` as simple Tailwind utility components since shadcn does not provide layout grid/container primitives.

**Rationale**: These are thin wrappers — `Container` applies `mx-auto max-w-screen-xl px-4` and `Grid` wraps CSS grid with responsive column props. No Radix primitives needed.

```
packages/ui/src/components/
├── grid.tsx        ← <Grid cols={3}> → responsive CSS grid
└── container.tsx   ← <Container> → centered max-width wrapper
```

### Decision 3: sonner as the toast library (per shadcn convention)

**Choice**: Add `sonner` as a dependency of `@mfe/ui` and export a `Toaster` component plus re-export `toast` from sonner.

**Rationale**: shadcn explicitly recommends sonner for toast notifications (per shadcn skill: "Toast via sonner. Use toast() from sonner."). Each MFE app renders `<Toaster />` once in its root layout; individual components call `toast()` to display notifications.

**Data flow**:
```
MFE component                  @mfe/ui            Browser
─────────────                  ────────            ───────
import { toast } from "@mfe/ui"
toast.success("Added to cart") ──→ sonner ──→ renders toast overlay
                                    ↑
                               <Toaster /> in app root
```

### Decision 4: Compound component patterns for Table, Tabs, DropdownMenu (per vercel-composition-patterns)

**Choice**: Export compound sub-components as individual named exports, following the same pattern as Card (CardHeader, CardTitle, etc.).

**Rationale**: Per vercel-composition-patterns `architecture-compound-components`, compound components with shared context are preferred over boolean prop proliferation. shadcn already structures these as compounds (Table → TableHeader/TableBody/TableRow/TableHead/TableCell).

### Decision 5: Field and FieldGroup as form layout primitives

**Choice**: Add `Field`, `FieldGroup`, `FieldLabel`, `FieldDescription` components via shadcn for form structural layout.

**Rationale**: Per shadcn skill critical rule: "Forms use FieldGroup + Field. Never use raw div with space-y-* or grid gap-* for form layout." These provide consistent spacing, label association, and validation state handling (`data-invalid` + `aria-invalid` pattern).

### Decision 6: One component per file, flat directory

**Choice**: Keep the flat `src/components/` directory structure with one file per component (or per component family for compounds).

**Rationale**: Matches existing pattern (button.tsx, card.tsx, input.tsx). shadcn CLI generates single files. The barrel `index.ts` re-exports everything, and consumers import from `@mfe/ui`.

```
packages/ui/src/components/
├── button.tsx          (existing)
├── card.tsx            (existing)
├── input.tsx           (existing)
├── label.tsx           (existing)
├── badge.tsx           (existing)
├── separator.tsx       (existing)
├── field.tsx           ← NEW (Field, FieldGroup, FieldLabel, FieldDescription)
├── select.tsx          ← NEW
├── checkbox.tsx        ← NEW
├── textarea.tsx        ← NEW
├── dialog.tsx          ← NEW
├── sheet.tsx           ← NEW
├── alert.tsx           ← NEW
├── skeleton.tsx        ← NEW
├── spinner.tsx         ← NEW
├── sonner.tsx          ← NEW (Toaster wrapper)
├── dropdown-menu.tsx   ← NEW
├── avatar.tsx          ← NEW
├── tabs.tsx            ← NEW
├── table.tsx           ← NEW
├── scroll-area.tsx     ← NEW
├── grid.tsx            ← NEW (custom)
└── container.tsx       ← NEW (custom)
```

### Decision 7: New dependencies added to packages/ui/package.json

**Choice**: Add `sonner` to `dependencies`. The `radix-ui` metapackage already in dependencies covers all needed Radix primitives (dialog, select, checkbox, tabs, dropdown-menu, avatar, scroll-area).

**Rationale**: The existing `"radix-ui": "^1.4.3"` dependency is the unified Radix package that includes all primitive components. Only `sonner` needs to be added as a net-new dependency.

## Risks / Trade-offs

- **[Bundle size increase]** → Mitigation: All components are tree-shakeable via named exports; MFEs only pay for what they import. Radix primitives are already in the dependency tree via the existing `radix-ui` package.
- **[sonner version coupling]** → Mitigation: Pin sonner in `@mfe/ui` package.json; MFE apps import toast via `@mfe/ui` so there's a single version. No version mismatch risk.
- **[Grid/Container are non-standard shadcn]** → Mitigation: These are intentionally thin (~20 lines each) utility components. If shadcn adds layout primitives in the future, we can migrate with minimal effort.
- **[Field/FieldGroup API surface]** → Mitigation: Follow shadcn's exact Field/FieldGroup API from the CLI output. Don't invent custom props — use `data-invalid` and `data-disabled` per the shadcn forms critical rule.
