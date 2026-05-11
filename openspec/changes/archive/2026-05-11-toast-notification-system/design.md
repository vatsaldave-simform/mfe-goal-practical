## Context

The application currently surfaces API errors and mutation feedback inline — error banners below form headers in `LoginPage`/`RegisterPage`, inline error text in `ProfilePage`, and silent failures for cart mutations. A `<Toaster>` component and `toast` export already exist in `packages/ui` (via `sonner`) but are not mounted anywhere and not called from any MFE.

Because all MFEs share a single React instance (ADR-005 MF singleton strategy), a single `<Toaster>` mounted in the host shell will capture `toast.*` calls from all remotes without any additional infrastructure.

## Goals / Non-Goals

**Goals:**
- Mount `<Toaster>` once in the host shell (no duplication across MFEs).
- Confirm `toast` is re-exported from `@mfe/ui` barrel so all MFEs share one import path.
- Replace inline API error banners in Login, Register, and Profile pages with `toast.error(…)`.
- Add success/error toasts for cart add, cart remove, order placement, and logout.
- Keep form field validation errors (`<FieldError>`) in place — those are per-field and accessibility-critical.

**Non-Goals:**
- Global axios interceptor toasting all 4xx/5xx (too noisy).
- Notification history or inbox.
- Mounting `<Toaster>` in MFE standalone dev apps (out of scope for now — not user-facing).
- Toast deduplication logic (sonner handles this natively with `toast.id`).

## Decisions

### Decision 1: Mount Toaster in host shell, not in each MFE

**Chosen**: `<Toaster>` lives in `apps/host/src/App.tsx` (or `ShellLayout`), rendered once alongside the route tree.

**Alternative**: Each MFE mounts its own `<Toaster>`.

**Rationale**: Per ADR-005, all MFEs share a single React instance via MF singletons. `sonner`'s `toast()` function posts to the nearest `<Toaster>` portal in the React tree. Since host owns the root React tree, one `<Toaster>` in host covers all remotes. Multiple `<Toaster>` instances would create duplicate toasts.

```
apps/host/src/App.tsx
  <BrowserRouter>
    <ShellLayout>         ← nav, outlet
      <Outlet />          ← lazy MFE components loaded here
    </ShellLayout>
    <Toaster />           ← single toast renderer, outside route outlet
  </BrowserRouter>
```

**Owner**: `apps/host`

---

### Decision 2: Call-site toasting (not hook-level defaults)

**Chosen**: `toast.*` calls live at the call site (page components / mutation `onSuccess`/`onError` callbacks passed at usage), not baked into the shared mutation hooks in `packages/api`.

**Alternative**: Add `onSuccess`/`onError` with default toast messages inside the mutation hooks in `packages/api/src/queries/`.

**Rationale**: Per tanstack-query-best-practices, mutation callbacks passed at the `useMutation` call site override the hook-level defaults and offer better context (e.g., item name in "Added 'Blue Shirt' to cart"). Baking toasts into `packages/api` would couple a UI concern into a shared data layer, violating separation of concerns. MFEs can pass `onSuccess`/`onError` to `useAddToCart`, `useRemoveFromCart`, `useCreateOrder`, etc.

**Owner**: `apps/storefront`, `apps/account`

---

### Decision 3: `toast` import from `@mfe/ui` barrel

**Chosen**: All MFEs import `toast` from `@mfe/ui`:
```ts
import { toast } from "@mfe/ui";
```

**Alternative**: Import directly from `sonner` in each MFE.

**Rationale**: `packages/ui` already re-exports `toast` from `sonner` in `sonner.tsx`. Centralising through `@mfe/ui` ensures a single source of truth for the toast API surface and respects ADR-007 (design system in `packages/ui`). If the toast library is ever swapped, only `packages/ui` needs updating. Per shadcn skill rules, all UI imports go through `@mfe/ui`.

**Owner**: `packages/ui` (verify barrel export), all MFE consumers

---

### Decision 4: Error message extraction

**Chosen**: Extract error messages using the existing inline pattern:
```ts
(error as AxiosError<{ error: string }>)?.response?.data?.error ?? "Something went wrong."
```

**Alternative**: Create a shared `extractErrorMessage(error)` utility in `packages/shared`.

**Rationale**: There are only ~4 call sites, so a utility is premature. If the count grows beyond 6, extract to `packages/shared/src/utils.ts`.

**Owner**: Each MFE page (local to call site for now)

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------ |
| MFE standalone dev mode (port 3001/3002 direct) has no `<Toaster>` mounted | Mount `<Toaster>` in standalone `AuthApp.tsx` / standalone dev entry in each MFE. Low priority — covered in a follow-up. |
| `sonner` not in `@mfe/ui` barrel export | Verify `packages/ui/src/index.ts` exports `toast` and `Toaster` before implementing MFE call sites. |
| Duplicate `<Toaster>` if someone mounts one in an MFE | Code review / lint — keep `<Toaster>` only in host. |
| Toast message on 401 + redirect creates flash before navigation | Skip toasting on 401 (axios interceptor already redirects). Only toast user-initiated action failures. |

## Migration Plan

1. Verify `packages/ui/src/index.ts` exports `{ toast, Toaster }`.
2. Add `<Toaster />` to `apps/host/src/App.tsx`.
3. Update `LoginPage` and `RegisterPage` — remove inline error block, add `toast.error(…)` in mutation `onError`.
4. Update `ProfilePage` — remove inline error block, add `toast.error(…)`.
5. Update cart call sites in `storefront` — add `toast.success/error` in cart mutation callbacks.
6. Update `CheckoutPage` — add `toast.success/error` for order placement.
7. Add `toast.success("Logged out")` to logout call site in host nav / account.

No server-side changes. No new dependencies. Rollback: revert inline error UI; remove `<Toaster>`.

## Open Questions

- Should standalone MFE dev entries (`AuthApp.tsx`) also mount `<Toaster>`? (Follow-up task, not blocking.)
- Should cart quantity update errors (in `QuantityControl`) also show a toast? Currently silent — likely yes, same pattern.
